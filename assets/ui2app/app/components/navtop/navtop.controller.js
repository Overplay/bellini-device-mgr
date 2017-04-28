/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navTopController", function ( $scope, $log, user, $rootScope, userAuthService ) {

    $log.debug( "Loading navTopController" );

    $scope.showBurgerMenu = false;

    $scope.links = [];

    if (!user){
        $window.location = '/';
    } else {


        $scope.links = [
            { label: "dash", sref: "dashboard", icon: "cube" },
            { label: "devices", sref: "devices.allactive", icon: "television" },
            { label: "network", sref: "network.dashboard", icon: "arrows-alt" },
            { label: "venues", sref: "venues.dashboard", icon: "globe" }
        ]


    }

    $scope.logout = function(){
        userAuthService.logout();
    }


    
    $scope.toggleSideMenu = function(){
        $rootScope.$broadcast("TOGGLE_SIDEMENU");
    }

} );