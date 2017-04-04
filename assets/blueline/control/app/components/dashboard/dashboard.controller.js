/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "dashboardController",
    function ( $scope, ogDevice, $log, uibHelper, ogNet, $state, $timeout ) {

        $log.info( "Loading dashboardController" );
        $scope.availableApps = [];
        
        function reloadAppList() {
            ogNet.getApps()
                .then( function ( apps ) {
                    $scope.availableApps = apps.available;
                    $scope.runningApps = apps.running;
                } )
                .catch( function ( err ) {
                    uibHelper.headsupModal( "We Have a Problem!", "We seem to have lost communication with your Ourglass system. Please check your WiFi connection and make sure the Ourglass is turned on." );
                } )
        }

        reloadAppList();

        $scope.$on(
            "$app_state_change",
            function ( event ) {
                $log.debug( "App State Change, reloading" );
                uibHelper.curtainModal('');
                $timeout(function(){
                    reloadAppList();
                    uibHelper.dismissCurtain();
                    }, 1000 );
            }
        );

        if ( !ogDevice.atVenueUUID ) {
            uibHelper.confirmModal( "Register?", "This Ourglass device has not been registered with a venue. Would you like to do that now?", true )
                .then( function () {
                    $state.transitionTo( 'register', { arg: 'arg' } );
                } )
        }

    } );