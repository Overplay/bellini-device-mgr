/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "managerDashboardController",
    function ( $scope, ogDevice, $log, uibHelper, ogNet, $state, $timeout, ogAPI, permissions ) {

        $log.info( "Loading dashboardController" );
        $scope.availableApps = [];

        $scope.permissions = permissions; //ogAPI.getPermissions();
        var _isAdmin = !$scope.permissions || ( $scope.permissions.manager || $scope.permissions.owner );
        $scope.ui = { isPaired: ogDevice.isPairedToSTB, isAdmin: _isAdmin };

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
                uibHelper.curtainModal( '' );
                $timeout( function () {
                    reloadAppList();
                    uibHelper.dismissCurtain();
                }, 1000 );
            }
        );

        $scope.meplay = function () {
            window.location.href = "http://138.68.230.239:8080/nghack/player/#!/play/" + ogAPI.getDeviceUDID();
        }

        if ( !ogDevice.atVenueUUID ) {
            uibHelper.confirmModal( "Register?", "This Ourglass device has not been registered with a venue. Would you like to do that now?", true )
                .then( function () {
                    $state.transitionTo( 'register', { arg: 'arg' } );
                } )
        }

    } );


app.controller( "patronDashboardController", function ( $scope, ogDevice, $log, uibHelper, ogNet ) {

    $log.info( "Loading patronDashboardController" );

    ogNet.getApps()
        .then( function ( apps ) {
            $scope.controllableApps = apps.running;
            _.remove( $scope.controllableApps, function(app){
                return !app.patronControllable;
            });
        } )
        .catch( function ( err ) {
            uibHelper.headsupModal( "We Have a Problem!", "We seem to have lost communication with your Ourglass system. Please check your WiFi connection and make sure the Ourglass is turned on." );
        } )


} );