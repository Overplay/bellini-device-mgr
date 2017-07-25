/**
 *
 * Basic OGDevice Management and Websocket Control
 * By MAK March 2017
 *
 */


app.controller( 'listOGDeviceController', function ( $scope, $log, ogdevices ) {

    $log.debug( "Loading listOGDeviceController" );
    $scope.ogdevices = ogdevices;
    $scope.ogdevices.forEach( function ( og ) {
        og.populateVenue();
    } );

} );

app.controller( 'oGDeviceDetailController', function ( device, $scope, $log, toastr, $timeout,
        belliniDM, uibHelper, sailsOGLogs, sailsVenues, $state ) {

    var pingStartTime;
    var pingWaitPromise;
    var identWaitPromise;


    $log.debug( "Loading listOGDeviceDetailController" );

    $scope.form = { launchAppId: '', killAppId: '' };

    $scope.ogdevice = device;

    function populateVenue(){
        $scope.ogdevice.populateVenue()
            .catch( function ( err ) {
                toastr.error( "Peer might be down or the venue assigned may have been deleted from it", "Bellini Core Error" );
            } );
    }

    populateVenue();

    $scope.$parent.ui = { pageTitle: "OG Box Detail", panelHeading: "For UDID: " + device.deviceUDID };

    function newDMMessage( data ) {
        $log.debug( 'Message rx for ' + JSON.stringify( data ) );
        if ( data.action == 'ping-ack' ) {
            $scope.pingResponse = { response: 'PING ACKed in ' + (new Date().getTime() - pingStartTime) + 'ms' };
            $timeout.cancel( pingWaitPromise );
        } else if ( data.action == 'ident-ack' ) {
            $scope.identResponse = data.payload;
            $timeout.cancel( identWaitPromise );
        }
    }

    function joinDeviceRoom() {
        io.socket.post( '/ogdevice/joinclientroom', { deviceUDID: device.deviceUDID },
            function gotResponse( data, jwRes ) {
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
    
    $scope.changeName = function(){

        uibHelper.stringEditModal( "Device Name", "Enter the new device name below.", $scope.ogdevice.name )
            .then( function ( name ) {
                $log.info( "New device name chosen: " + name );
                if ( name ) {
                    $scope.ogdevice.name = name;
                    belliniDM.changeDeviceName($scope.ogdevice.deviceUDID, $scope.ogdevice.name)
                        .then( function(){
                            toastr.success("Device name changed");
                        })
                        .catch( function(e){
                            toastr.error("Error changing device name");
                        })
                } else {
                    toastr.error( "You can't have a blank event name, Sparky." );
                }
            } )
    
    
    }

    $scope.changeVenue = function () {

        sailsVenues.getAll()
            .then( function(venues){

                var venueList = venues.map( function ( v ) {
                    return v.name;
                } );

                uibHelper.selectListModal( "Device Venue", "Pick the new device venue from the list below.", venueList, 0 )
                    .then( function ( idx ) {
                        $log.info( "New venue chosen: " + idx );
                        $scope.ogdevice.atVenueUUID = venues[ idx ].uuid;
                        $scope.ogdevice.save()
                            .then( function ( d ) {
                                toastr.success( "Venue Changed" );
                                populateVenue();
                            } )
                            .catch( function ( err ) {
                                toastr.error( "Venue Could not be Changed" );
                            } )

                    } )

            })
            .catch( function(err){
                $log.error("Couldn't get venues, peer BC service may be down.");
                toastr.error( err.message, "Venues Could Not Be Retrieved" );

            })




    }

    function endPingWait() {
        $log.error( "No ping response in 5 second window!" );
        $scope.pingResponse = { response: "NO ACK after 5 seconds. Device is probably down!" };
    }


    $scope.ping = function () {
        $scope.pingResponse = { response: "ISSUING PING..." };
        pingStartTime = new Date().getTime();

        io.socket.post( '/ogdevice/message', {
            deviceUDID: device.deviceUDID,
            destination: 'device',
            message:    {  action: 'ping', payload: 'Ping me back, bro!' }
        }, function ( resData, jwres ) {
            if ( jwres.statusCode == 200 ) {
                toastr.success( "Ping Issued" );
                pingWaitPromise = $timeout( endPingWait, 5000 );
            }
            else {
                $scope.pingResponse = { response: "PING FAILED to connect to Bellini!" };
                toastr.error(  jwres.error.error, "Could not issue ping!");
            }

        } );

    };

    $scope.identify = function () {
        $scope.identResponse = {};
        io.socket.post( '/ogdevice/message', {
            deviceUDID: device.deviceUDID,
            destination: 'device',
            message:    { action: 'identify' }
        }, function ( resData, jwres ) {
            if ( jwres.statusCode == 200 ) {
                toastr.success( "Ident Issued" );
                identWaitPromise = $timeout( function(){
                    $log.error( "No ident response in 5 second window!" );
                    $scope.identResponse = "No response in 5 seconds.";
                }, 5000);
            }
            else {
                $scope.identResponse = { response: "IDENT FAILED" };
                toastr.error( "Could not issue ident!" );
            }

        } );
    };

    $scope.launch = function () {

        if ( !$scope.form.appId ) {
            toastr.error( "Try adding an appId sparky!" );
            return;
        }

        belliniDM.launchAppOnDevice( device.deviceUDID, $scope.form.appId )
            .then( function ( d ) {
                toastr.success( "Launch requested!" );
            } )
            .catch( function ( err ) {
                toastr.error( "No launch for you!" );
            } );

    };

    $scope.kill = function () {

        if ( !$scope.form.appId ) {
            toastr.error( "Try adding an appId sparky!" );
            return;
        }

        belliniDM.killAppOnDevice( device.deviceUDID, $scope.form.appId )
            .then( function ( d ) {
                toastr.success( "Kill requested!" );
            } )
            .catch( function ( err ) {
                toastr.error( "No kill for you!" );
            } );

    };

    $scope.move = function () {

        if ( !$scope.form.appId ) {
            toastr.error( "Try adding an appId sparky!" );
            return;
        }

        belliniDM.moveAppOnDevice( device.deviceUDID, $scope.form.appId )
            .then( function ( d ) {
                toastr.success( "Move requested!" );
            } )
            .catch( function ( err ) {
                toastr.error( "No move for you!" );
            } );

    };

    $scope.delete = function(){

        uibHelper.confirmModal("Are you Sure?", "Really Delete?", true)
            .then(function(){
                return $scope.ogdevice.delete();
            })
            .then(function(){
                toastr.success("Nuked");
                $state.go('devices.allactive');
            })
            .catch(function(){
                toastr.error("Whoops");
            })

    }

    $scope.pingResponse = { response: "WAITING to PING" };

    joinDeviceRoom();

    // Load all logs
    // sailsOGLogs.getAll('deviceUDID='+device.deviceUDID)
    //     .then( function(logs){
    //         $scope.logs = logs;
    //         toastr.success(logs.length+' logs loaded');
    //     })
    //     .catch( function(err){
    //         toastr.error("Could not load logs");
    //     })


} );