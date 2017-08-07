/**
 * Created by mkahn on 8/1/17.
 */

app.controller('switchController', function($scope, permissions, $log, $state, ogNet){

    $log.debug('loaded switchController');
    $scope.permissions = permissions;

    if (permissions.anyManager && !ogNet.isMasqueradingAsPatron){
        $state.go('top.mdash');
    } else {
        $state.go('top.pdash');
    }

});