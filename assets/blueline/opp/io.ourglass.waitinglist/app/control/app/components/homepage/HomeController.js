/**
 * Created by mkahn on 4/28/15.
 */

app.controller("homeController", function ($scope, $log, waitList, uibHelper, $timeout ) {

    $log.info("Loading homeController");

    $scope.ui = { firstLoad: true };

    uibHelper.curtainModal('Loading Waitlist');

    $scope.venueData = waitList.getUsingVenueData();

    $scope.swapDataLocation = waitList.swapDataLocation;

    $scope.$on('DEVICE_MODEL_CHANGED', function(){
        $scope.deviceParties = waitList.getCurrentList();
    });
    
    $scope.$on('VENUE_MODEL_CHANGED', function(){
        $scope.venueParties = waitList.getCurrentList();
    });

    $scope.$on('DATA_LOCATION_CHANGED', function () {
        $scope.venueData = waitList.getUsingVenueData();
    })

    $scope.logInfo = function () {
        $log.debug("Log Button Pressed");
        $log.debug("Venue Data: ", $scope.venueParties);
        $log.debug("Device Data: ", $scope.deviceParties);
    }
    
    function initialize() {
        if (waitList.getUsingVenueData())
        {
            waitList.loadModel('venue')
                .then(function (list) {
                    $scope.venueParties = list;
                })
                .finally(function () {
                    uibHelper.dismissCurtain();
                    $scope.ui.firstLoad = false;
                })
        } else {
            waitList.loadModel()
                .then(function (list) {
                    $scope.deviceParties = list;
                })
                .finally(function () {
                    uibHelper.dismissCurtain();
                    $scope.ui.firstLoad = false;
                })
        }

    }

    initialize();

    //TODO: Fix this shit, it's a really really bad hack that 'sorta' works and I hate it
    //This is so that when you navigate to homeController from addController, it properly shows new added items
    //This also makes both the venue and controller blink
    //Not to mention, it sends two PUT requests
    //AND it also has no guarantee of both calls working, which could lead to wonky switching shit behavior that sucks a lot
    $timeout(function () {
        $scope.swapDataLocation();
        $scope.swapDataLocation();
    }, 100); 

});

