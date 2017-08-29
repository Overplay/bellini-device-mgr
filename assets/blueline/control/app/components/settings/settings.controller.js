/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "settingsController",
    function ( $scope, ogDevice, $log, uibHelper, ogNet ) {

        $log.info( "Loading settingsController" );
        
        $scope.system = ogDevice;

        $scope.updateSystemName = function () {
            uibHelper.confirmModal( "Update?", "Are you sure you want to update the system name to: "+ $scope.system.name +"?", true )
                .then( function ( resp ) {
                    $log.debug( "Responded yes..." );
                    var hud = uibHelper.curtainModal('Updating...');
                    ogNet.changeSystemName( $scope.system.name )
                        .then( function ( response ) {
                            hud.dismiss();
                            uibHelper.headsupModal('Settings Changed', 'Name successfully updated.');
                        } )
                } )
        };
        
    
    } );