/**
 * Created by mkahn on 8/1/17.
 */

app.controller("topTabBarController", function($scope, permissions, $log, ogNet, $state){

    $log.debug("loading topTabBarController");
    $scope.permissions = permissions;
    $scope.permissions.isMaqueradingAsPatron = ogNet.isMasqueradingAsPatron;

    $scope.toggleMasqMode = function(){
        $scope.permissions.isMaqueradingAsPatron = ogNet.toggleMasquerade();
        $state.go("top", {}, { reload: true }); // start again
    }

    $scope.showManagerTabs = function(){
        return !ogNet.isMasqueradingAsPatron && $scope.permissions.anymanager;
    }

    $scope.$on('MASQUERADE_MODE_CHANGE', function(ev, data){
        $log.debug("Masquerade mode changed to: "+data.isMasquerading);
        $scope.permissions.isMaqueradingAsPatron = data.isMasquerading;
    })

});