/**
 * Created by mkahn on 11/18/16.
 */

app.controller("homeController", function ($scope, $log, ogAPI, uibHelper, nowServing) {

    $log.debug("loaded homeController");


    //Value Pull (Doesn't sync on remote change)
    $scope.deviceTicketNumber = nowServing.deviceTicketNumber || "---";
    $scope.venueTicketNumber = nowServing.venueTicketNumber || "---";
    $scope.usingVenueData = nowServing.usingVenueData;


    //Function Bind-Through
    $scope.clear = nowServing.clear;
    $scope.incrementTicket = nowServing.incrementTicket;
    $scope.setTicket = nowServing.setTicket;
    $scope.swapDataLocation = nowServing.swapDataLocation;


    //Syncs values from nowServing when they change
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