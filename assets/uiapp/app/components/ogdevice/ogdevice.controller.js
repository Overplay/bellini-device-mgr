/**
 *
 * Basic OGDevice Management and Websocket Control
 * By MAK March 2017
 *
 */


app.controller( 'listOGDeviceController', function ( devices, $scope, $log, bVenues ) {


    $log.debug( "Loading listOGDeviceController" );

    $scope.ogdevices = devices;

    $scope.ogdevices.forEach( function(og){
        if (!og.atVenueUUID) {
            og['venueName'] = "unassigned";
        } else {
            bVenues.getByUUID(og.atVenueUUID)
                .then(function(v){
                    og[ 'venueName' ] = v.name;
                })
                .catch(function(e){
                    og[ 'venueName' ] = "Lookup Problem";
                })
        }
    });

    $scope.$parent.ui = { pageTitle: "OG Boxes", panelHeading: "All Boxes" }


} );

app.controller( 'oGDeviceDetailController', function ( device, $scope, $log, toastr, $timeout ) {

    var pingStartTime;
    var pingWaitPromise;

    $log.debug( "Loading listOGDeviceDetailController" );

    $scope.form = { launchAppId: '', killAppId: '' };

    $scope.ogdevice = device;

    $scope.$parent.ui = { pageTitle: "OG Box Detail", panelHeading: "For UDID: " + device.deviceUDID };

    function newDMMessage( data ) {
        $log.debug( 'Message rx for ' + JSON.stringify( data ) );
        if ( data.action == 'ping-ack' ) {
            $scope.pingResponse = { response: 'PING ACKed in ' + (new Date().getTime() - pingStartTime) + 'ms' };
            $timeout.cancel( pingWaitPromise );
        } else if ( data.action == 'ident-ack' ) {
            $scope.identResponse = data.payload;
        }
    }

    function joinDeviceRoom() {
        io.socket.post( '/ogdevice/joinroom', { deviceUDID: device.deviceUDID },
            function gotResponse( data, jwRes ) {
                "use strict";
                if ( jwRes.statusCode != 200 ) {
                    $log.error( "Could not connect to device room!!!" );
                } else {
                    $log.debug( "Successfully joined room for this device" );
                    io.socket.on( 'DEVICE-DM', function ( data ) {
                        $scope.$apply( function () {
                            newDMMessage( data );
                        } );
                    } );
                }
            } );
    }

    //
    // io.socket.on( "connect", function () {
    //     $log.debug( "(Re)Connecting to websockets rooms" );
    //     joinDeviceRoom();
    //     //subscribeToAppData();
    // } );
    //
    //

    function endPingWait() {
        $log.error( "No ping response in 5 second window!" );
        $scope.pingResponse = { response: "NO ACK after 5 seconds. Device is probably down!" };
    }


    $scope.ping = function () {
        $scope.pingResponse = { response: "ISSUING PING..." };
        pingStartTime = new Date().getTime();

        io.socket.post( '/ogdevice/dm', {
            deviceUDID: device.deviceUDID,
            message:    { dest: device.deviceUDID, action: 'ping', payload: 'Ping me back, bro!' }
        }, function ( resData, jwres ) {
            if ( jwres.statusCode == 200 ) {
                toastr.success( "Ping Issued" );
                pingWaitPromise = $timeout( endPingWait, 5000 );
            }
            else {
                $scope.pingResponse = { response: "PING FAILED to connect to Bellini!" };
                toastr.error( "Could not issue ping!" );
            }

        } );

    };

    $scope.identify = function () {
        $scope.identResponse = {};
        io.socket.post( '/ogdevice/dm', {
            deviceUDID: device.deviceUDID,
            message:    { dest: device.deviceUDID, action: 'identify' }
        }, function ( resData, jwres ) {
            if ( jwres.statusCode == 200 ) {
                toastr.success( "Ident Issued" );
                pingWaitPromise = $timeout( endPingWait, 5000 );
            }
            else {
                $scope.identResponse = { response: "IDENT FAILED" };
                toastr.error( "Could not issue ident!" );
            }

        } );
    }

    $scope.launch = function () {

        if (!$scope.form.appId){
            toastr.error("Try adding an appId sparky!");
            return;
        }

        io.socket.post( '/ogdevice/dm', {
            deviceUDID: device.deviceUDID,
            message:    {
                dest:    device.deviceUDID,
                action:  'launch',
                appId:  $scope.form.appId,
                appType: "widget",
                fullUrl: "path-here"
            }
        }, function ( resData, jwres ) {
            if ( jwres.statusCode == 200 ) {
                toastr.success( "Launch Issued" );
            }
            else {
                toastr.error( "Could not issue launch!" );
            }

        } );
    };

    $scope.pingResponse = { response: "WAITING to PING" };

    joinDeviceRoom();


} );