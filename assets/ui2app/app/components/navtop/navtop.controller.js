/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, user, $rootScope, navService, userAuthService, $state ) {

    $log.debug( "Loading navTopController" );

    $rootScope.showSideMenu = true;

    if ( !user ) {
        $window.location = '/';
    } else {
        $scope.links = navService.topMenu.buildForUser( user );
    }

    $scope.logout = function () {
        userAuthService.logout();
    }

    $scope.account = function () {
        $state.go( 'user.edit', { id: user.id } );
    }

    $scope.toggleSideMenu = function () {
        $rootScope.showSideMenu = !$rootScope.showSideMenu;
        $rootScope.$broadcast( "TOGGLE_SIDEMENU", { show: $rootScope.showSideMenu } );
    }

} );