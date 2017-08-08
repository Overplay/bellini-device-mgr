/**
 * Created by mkahn on 11/18/16.
 */

app.controller("ogNowServingController", function ($scope, $log, ogAPI, uibHelper, $timeout, nowServing) {

    $log.debug("loaded ogNowServingController");

    $scope.deviceTicketNumber = nowServing.deviceTicketNumber || "---";
    $scope.venueTicketNumber = nowServing.venueTicketNumber || "---";
    $scope.usingVenueData = nowServing.usingVenueData;

    $scope.clear = nowServing.clear;
    $scope.incrementTicket = nowServing.incrementTicket;
    $scope.setTicket = nowServing.setTicket;
    $scope.swapDataLocation = nowServing.swapDataLocation;

    $scope.$on('DATA_CHANGED', function (event, {device, venue}) {
        $scope.deviceTicketNumber = device.ticketNumber;
        $scope.venueTicketNumber = venue.ticketNumber;        
    });

    $scope.$on('DATA_LOC_CHANGED', function (event, usingVenueData) {
        $scope.usingVenueData = usingVenueData;
    });

    $scope.$on('DATA_LOADED', function (event, { deviceTicketNumber, venueTicketNumber, usingVenueData }) {
        $scope.deviceTicketNumber = deviceTicketNumber || "---";
        $scope.venueTicketNumber = venueTicketNumber || "---";
        $scope.usingVenueData = usingVenueData;
    });

    // $scope.curtainDebug = function () {
    //     var curtain = uibHelper.curtainModal('Curtain');
    //     $timeout(function () { uibHelper.dismissCurtain(); }, 5000);
    // };

} );