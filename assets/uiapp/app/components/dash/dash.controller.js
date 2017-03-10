/**
 * Created by cole on 7/15/16.
 */


app.controller("dashController", function ($scope, $log, user, $state, $filter) {
    $log.log("starting dashController")

    // $log.log(user)
    
    $scope.roles = $filter('orderBy')(user.roleTypes); //TODO sort these

    $scope.humanize = function(role){
        var sub = role.split('.');
        if (sub[1])
            return sub[1];
        else return role;
    }


    $scope.selected = $scope.roles[0]

    $log.log($scope.selected)


    $state.go("dash." +$scope.selected.replace('.', ''))

    //TODO default dash view? change button style?
    //highlight current view button


});




