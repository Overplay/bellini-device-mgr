/**
 *
 * Basic OGDevice Management and Websocket Control
 * By MAK March 2017
 *
 */

app.controller( 'listOGReleasesController', function ( $scope, $log, uibHelper, toastr, releases ) {

    $log.debug( "Loading listOGReleasesController" );
    $scope.releases = releases;

    $scope.delete = function(release){
        uibHelper.confirmModal("Confirm", "Do you really want to delete: "+ release.filename+"?")
            .then(function(){
                release.delete()
                    .then( function(){
                        $scope.releases = _.without( $scope.releases, release );
                        toastr.success("Release deleted");
                    })
                    .catch( function(err){
                        toastr.error("Could not delete release. "+err.message);
                    })

            })
    }

} );

app.controller('editOGReleasesController', function ( $scope, release, $log, uibHelper, toastr,
                                    $state, dialogService, $rootScope, sailsOGAndroidRelease ) {

        $log.debug( "Loading editOGReleasesEditController" );
        $scope.release = release;

        $scope.editors = dialogService;

        function terror( err ) {
            if (err==='cancel'){
                toastr.warning( 'Edit abandoned');
            } else {
                toastr.error( err.message );

            }
        }

        $scope.changeStringField = function ( field, prompt, textArea ) {

            uibHelper.stringEditModal( prompt, "", $scope.release[ field ], field, textArea )
                .then( function ( newString ) {
                    $log.debug( 'String for ' + field + ' changed to: ' + newString );
                    $scope.release[ field ] = newString;
                    $scope.release.save()
                        .then( function () {
                            toastr.success( "Field changed" );
                        } )
                        .catch( terror );
                } );

        };

        $scope.selectStringField = function ( field, prompt ) {

            var selections;

            switch ( field ) {
                case 'releaseLevel':
                    selections = sailsOGAndroidRelease.selections.releaseLevel;
                    break;
            }

            uibHelper.selectListModal( prompt, '', selections, $scope.release[ field ] )
                .then( function ( idx ) {
                    $log.debug( field + ' changed to: ' + selections[ idx ] );
                    $scope.release[ field ] = selections[ idx ];
                    $scope.release.save()
                        .then( function () {
                            toastr.success( "Field changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing field!" );
                        } );
                } );


        };


        $scope.boolChanged = function(){
            $scope.release.save()
                .then( function ( w ) {
                    toastr.success( 'Field updated' )
                } )
                .catch( terror );
        };


        if ( !release.id ) {
            uibHelper.stringEditModal('New Release?', "Please enter the release's filename.", "")
                .then(function (newfilename) {
                    // TODO validate!
                    $scope.release.filename = newfilename;
                    return $scope.release.save();
                })
                .catch(function (err) {
                    $state.go($rootScope.lastUiState.state, $rootScope.lastUiState.params);
                })
        }

});

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