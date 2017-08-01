/**
 * Created by mkahn on 11/18/16.
 */

app.controller("ogNowServingController", function ($scope, $log, ogAPI, uibHelper, $timeout ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.ticketNumber = '---';
    $scope.usingVenueData = true;

    function saveModel() {

        ogAPI.model = { ticketNumber: $scope.ticketNumber };
        if ($scope.usingVenueData) {
            savePromiseThen(ogAPI.saveVenueModel());
        } else {
            savePromiseThen(ogAPI.saveDeviceModel());
        }

    }

    function savePromiseThen(savePromise) {
        savePromise.then(function (response) {
            $log.debug("Save was cool");
        })
            .catch(function (err) {
                $log.error("WTF?!?!?");
                $scope.ticketNumber = "&*$!";
            });
    }

    $scope.clear = function () {
    
        $log.debug( "Clear pressed" );
        $scope.ticketNumber = 0;
        // ogControllerModel.model = {ticketNumber: 0};

        saveModel();

    };

    $scope.incrementTicket = function () {
    
        $log.debug("Increment pressed");
        if ($scope.ticketNumber === '---')
            $scope.ticketNumber = 1;
        else
            $scope.ticketNumber += 1;
        // ogControllerModel.model.ticketNumber = $scope.ticketNumber;

        saveModel();

    };

    $scope.setTicket = function () {

        $log.debug("Change Ticket Pressed ");
        uibHelper.stringEditModal(
            'Change Order Number',
            'Enter the new order number below.',
            $scope.ticketNumber,
            'order number'
        ).then(function (result) {
            if (_.isFinite(_.parseInt(result)) && _.parseInt(result) >= 0) {
                $scope.ticketNumber = _.parseInt(result);       
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
        $scope.ticketNumber = newValue.ticketNumber;
    }

    function venueModelChanged( newValue ) {
        $log.info( "Venue model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
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
            $log.debug( "ogAPI init complete!" );
            if ( data.venue && data.device.useVenueData ) {
                $scope.ticketNumber = data.venue.ticketNumber || '??';
            } else {
                $scope.ticketNumber = data.device.ticketNumber;
            }
        })
        .catch(function (err) {
            $log.error("Something failed: " + err);
        });

    }

    initialize();

} );