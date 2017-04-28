/**
 * Created by mkahn on 4/26/17.
 */

app.controller('myAccountController', ['$scope','me', '$log', function($scope, me, $log){

    $log.debug("Loading myAccountController");
    $scope.me = me;



}]);