/**
 * Created by mkahn on 4/28/15.
 */

app.controller("homeController", function ($scope, $log, waitList, uibHelper, permissions, $state ) {

    $log.info("Loading homeController");

    if (!permissions.anymanager)
        $state.go('patron');

    $scope.ui = { firstLoad: true, isVenueData: waitList.isVenueData() };

    uibHelper.curtainModal('Loading Waitlist');


    $scope.$on('DATA_CHANGED', function(){
        $scope.parties = waitList.getCurrentList();
    });


    waitList.getCurrentList()
        .then( function(model){
            $scope.parties = model.parties || [];
            uibHelper.dismissCurtain();
        })



});

