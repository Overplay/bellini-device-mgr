/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, $rootScope, navService, userAuthService, $state ) {

    $log.debug( "Loading navTopController" );

    $rootScope.showSideMenu = true;

    // moved out of route resolves because it is always needed and became a PITAS
    userAuthService.getCurrentUser()
        .then( function(user) {
            if ( !user ) {
                $window.location = '/';
            } else {
                $scope.links = navService.topMenu.buildForUser( user );
                $scope.account = function () {
                    $state.go( 'user.edit', { id: user.id } );
                }
            }
        })
        .catch( function(err) {
            $log.error("Navbar could not determine user, bailing out");
            $window.location = '/';
        });


    $scope.logout = function () {
        userAuthService.logout();
    }

    // $scope.account = function () {
    //     $state.go( 'user.edit', { id: user.id } );
    // }

    $scope.toggleSideMenu = function () {
        $rootScope.showSideMenu = !$rootScope.showSideMenu;
        $rootScope.$broadcast( "TOGGLE_SIDEMENU", { show: $rootScope.showSideMenu } );
    }

} );