/**
 * Created by mkahn on 4/21/17.
 */

app.controller("navSideController", function($scope, $log, navService
,$timeout, $window, $rootScope){

    $log.debug("Loading navSideController");

    $scope.menuVisible = true;

    var links = navService.sideMenu.getMenu() || [];
    var idx = 0;

    function addNextLink() {
        $scope.sidelinks.push( links[ idx ] );
        idx++;
        if ( idx < links.length )
            $timeout( addNextLink, 50 );
    }

    $scope.sidelinks = [];

    if ( links.length )
        addNextLink();

    $scope.$on( 'TOGGLE_SIDEMENU', function ( ev, data ) {
        $scope.menuVisible = $rootScope.showSideMenu = data.show;
    } );

    $scope.$on( 'CHANGE_SIDEMENU', function ( ev, data ) {
        idx = 0;
        links = [];
        $scope.sidelinks = [];
        $timeout( function () {
            links = data || [];
            addNextLink();
        }, 1000 );
    } );

});