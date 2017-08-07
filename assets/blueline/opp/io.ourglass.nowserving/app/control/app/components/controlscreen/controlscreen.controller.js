/**
 * Created by mkahn on 11/18/16.
 */

app.controller("ogNowServingController", function ($scope, $log, ogAPI, uibHelper, $timeout) {

    $log.debug("loaded ogNowServingController");

    $scope.deviceTicketNumber = '---';
    $scope.venueTicketNumber = '---';
    $scope.usingVenueData = false;

    function saveModel() {

        ogAPI.model = { ticketNumber: $scope.deviceTicketNumber, usingVenueData: $scope.usingVenueData };
        ogAPI.venueModel = { ticketNumber: $scope.venueTicketNumber, usingVenueData: $scope.usingVenueData };
        
        // if ($scope.usingVenueData) {
            savePromiseThen(ogAPI.saveVenueModel());
        // } else {
            savePromiseThen(ogAPI.saveDeviceModel());
        // }

    }

    function savePromiseThen(savePromise) {
        savePromise.then(function (response) {
            $log.debug("Save was cool");
        })
            .catch(function (err) {
                $log.error("WTF?!?!?");
                $scope.deviceTicketNumber = "&*$!";
                $scope.venueTicketNumber = "&*$!";
            });
    }

    $scope.clear = function () {
    
        $log.debug("Clear pressed");
        if ($scope.usingVenueData) {
            $scope.venueTicketNumber = 0;
        } else {
            $scope.deviceTicketNumber = 0;
        }
        // ogControllerModel.model = {ticketNumber: 0};

        saveModel();

    };

    $scope.incrementTicket = function () {
    
        $log.debug("Increment pressed");

        var toCheck = $scope.usingVenueData ? $scope.venueTicketNumber : $scope.deviceTicketNumber;

        if (toCheck === '---') {

            if ($scope.usingVenueData) {
                $scope.venueTicketNumber = 1;
            } else {
                $scope.deviceTicketNumber = 1; 
            }
        }
        else {
            if ($scope.usingVenueData) {
                $scope.venueTicketNumber += 1;
            } else {
                $scope.deviceTicketNumber += 1; 
            }
        }
        // ogControllerModel.model.ticketNumber = $scope.deviceTicketNumber;

        saveModel();

    };

    $scope.setTicket = function () {

        $log.debug("Change Ticket Pressed ");
        uibHelper.stringEditModal(
            'Change Order Number',
            'Enter the new order number below.',
            $scope.usingVenueData ? $scope.venueTicketNumber : $scope.deviceTicketNumber,
            'order number'
        ).then(function (result) {

            if (isFinite(result) && _.parseInt(result) >= 0) {
                
                var numberResult = _.parseInt(result);
                if ($scope.usingVenueData) {
                    $scope.venueTicketNumber = numberResult;
                } else {
                    $scope.deviceTicketNumber = numberResult;
                }   
                saveModel();
            } else {
                uibHelper.dryToast("You must enter a positive number.");
            }
        }).catch(function (err) {
            $log.error(err);
        });

    };

    $scope.swapDataLocation = function () {
        $log.debug("Using venue data:", $scope.usingVenueData);
        $scope.usingVenueData = !$scope.usingVenueData;
        saveModel();
    };

    // $scope.curtainDebug = function () {
    //     var curtain = uibHelper.curtainModal('Curtain');
    //     $timeout(function () { uibHelper.dismissCurtain(); }, 5000);
    // };

    function modelChanged( newValue ) {
        $log.info( "Device model changed, yay!" );
        $scope.deviceTicketNumber = newValue.ticketNumber;
    }

    function venueModelChanged( newValue ) {
        $log.info( "Venue model changed, yay!" );
        $scope.venueTicketNumber = newValue.ticketNumber;
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.ogsystem = msg;
    }

    function initialize() {

        $log.debug( "initializing app and data" );

        ogAPI.init({
            appName: "io.ourglass.nowserving",
            deviceModelCallback: modelChanged,
            venueModelCallback:  venueModelChanged,
            messageCallback:     inboundMessage,
            appType: 'mobile',
            deviceUDID: 'apple-sim-1'
        })
        .then(function (data) {
            
            $scope.deviceTicketNumber = data.device.ticketNumber;
            $scope.venueTicketNumber = data.venue.ticketNumber;
            $scope.usingVenueData = data.device.usingVenueData;

            $log.debug( "ogAPI init complete!" );
            // if ( data.venue && data.device.useVenueData ) {
            //     $scope.deviceTicketNumber = data.venue.ticketNumber || '??';
            // } else {
            //     $scope.deviceTicketNumber = data.device.ticketNumber;
            // }
        })
        .catch(function (err) {
            $log.error("Something failed: " + err);
        });
        

    }

    initialize();

} );