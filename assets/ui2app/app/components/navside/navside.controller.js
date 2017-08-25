/**
 * Created by mkahn on 4/21/17.
 */

app.controller( "navSideController", function ( $scope, $log, sideMenuService ) {

    $log.debug( "Loading navSideController" );

    // Not using the sliding menu for now
    $scope.menuVisible = true;

    $scope.sidelinks = sideMenuService.getMenu();

    $scope.$on( 'TOGGLE_SIDEMENU', function ( ev ) {
        $scope.menuVisible = !$scope.menuVisible;
    } );

    $scope.$on( "NEW_SIDEMENU", function ( ev, data ) {
        $log.debug( "Sidemenu changed." );
        $scope.sidelinks = data;
    } )


} );