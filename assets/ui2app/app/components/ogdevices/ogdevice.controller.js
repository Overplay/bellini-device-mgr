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


} );