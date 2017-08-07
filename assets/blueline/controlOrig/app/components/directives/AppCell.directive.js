/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'appCell', 
    function ( $log, ogAPI, $rootScope ) {
        return {
            restrict:    'E',
            scope:       {
                app: '=',
                permissions: '='
            },
            templateUrl: 'app/components/directives/appcell.template.html',
            link:        function ( scope, elem, attrs ) {

                scope.running = attrs.running;

                scope.hasMgrPermission = function(){

                    // So this is a little goofy right now. If there are no permissions, then you can see all.
                    return !scope.permissions || ( scope.permissions.manager || scope.permissions.owner );

                }

                scope.launch = function(){
                    ogAPI.launch(scope.app.appId)
                        .then( function(resp){
                            $log.debug('Launch was ok');
                        })
                        .catch( $log.error )
                }

                scope.move = function () {
                    ogAPI.move( scope.app.appId )
                        .then( function ( resp ) {
                            $log.debug( 'Move was ok' );
                        } )
                        .catch( $log.error )
                }

                scope.kill = function () {
                    ogAPI.kill( scope.app.appId )
                        .then( function ( resp ) {
                            $log.debug( 'Kill was ok' );
                        } )
                        .catch( $log.error )
                }
                
                scope.control = function(){
                    ogAPI.relocToControlApp(scope.app)
                }
                
            }
        }
    } 
);