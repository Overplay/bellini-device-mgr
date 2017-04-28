/**
 * Created by mkahn on 4/21/17.
 */

app.controller("navSideController", function($scope, $log, sideMenu){

    $log.debug("Loading navSideController");

    // Not using the sliding menu for now
    $scope.menuVisible = true;

    $scope.sidelinks = sideMenu.getMenu();
    
    $scope.$on('TOGGLE_SIDEMENU', function(ev){
        $scope.menuVisible = !$scope.menuVisible;
    });


});