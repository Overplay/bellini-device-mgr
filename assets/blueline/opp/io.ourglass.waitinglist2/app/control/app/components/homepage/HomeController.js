/**
 * Created by mkahn on 4/28/15.
 */

app.controller("homeController", function ($scope, $log, waitList, $interval, uibHelper ) {

    $log.info("Loading homeController");

    $scope.ui = { firstLoad: true };

    uibHelper.curtainModal('Loading Waitlist');

    $scope.$on('MODEL_CHANGED', function(){
        $scope.parties = waitList.getCurrentList();
    });

    function initialize() {
        waitList.loadModel()
            .then( function ( list ) {
                $scope.parties = list;
            })
            .finally( function () {
                uibHelper.dismissCurtain();
                $scope.ui.firstLoad = false;
            })
    }

    initialize();
});

