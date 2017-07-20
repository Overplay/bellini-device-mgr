/**
 * Created by mkahn on 4/26/17.
 */

app.controller('myAccountController', ['$scope','user', '$log', function($scope, user, $log){

    $log.debug("Loading myAccountController");
    $scope.me = user;

}]);