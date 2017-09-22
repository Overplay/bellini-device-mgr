/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogNowServingController", function ( $scope, $log, ogAPI, uibHelper, $timeout ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.deviceTicketNumber = '-';
    $scope.venueTicketNumber = '-';
    $scope.useVenueData = false;

    function processData() {
        $scope.useVenueData = ogAPI.model.useVenueData;
        $scope.ticketNumber = $scope.useVenueData ? ogAPI.venueModel.ticketNumber :
            ogAPI.model.ticketNumber;
    }

    function saveError() {
        uibHelper.dryToast( "Error Resetting Number" );
    }

    function save() {
        ogAPI.saveAll()
            .then( processData )
            .catch( saveError )
    }

    $scope.clear = function () {

        $log.debug( "Clear pressed" );
        if ( $scope.useVenueData ) {
            ogAPI.venueModel.ticketNumber = 0;
        } else {
            ogAPI.model.ticketNumber = 0;
        }

        save();

    };

    $scope.incrementTicket = function () {

        $log.debug( "Increment pressed" );
        if ( $scope.useVenueData ) {
            ogAPI.venueModel.ticketNumber++;
        } else {
            ogAPI.model.ticketNumber++;
        }

        save();


    };

    $scope.setTicket = function () {

        $log.debug( "Change Ticket Pressed " );
        uibHelper.stringEditModal(
            'Change Order Number',
            'Enter the new order number below.',
            $scope.useVenueData ? $scope.venueTicketNumber : $scope.deviceTicketNumber,
            'order number'
        ).then( function ( result ) {

            if ( isFinite( result ) && _.parseInt( result ) >= 0 ) {

                var numberResult = _.parseInt( result );
                if ( $scope.useVenueData ) {
                    ogAPI.venueModel.ticketNumber = numberResult;
                } else {
                    ogAPI.model.ticketNumber = numberResult;
                }

                save();


            } else {
                uibHelper.dryToast( "You must enter a positive number." );
            }
        } ).catch( function ( err ) {
            $log.error( err );
        } );

    };

    $scope.swapDataLocation = function () {
        $scope.useVenueData = !$scope.useVenueData;
        ogAPI.model.useVenueData = $scope.useVenueData;
        save();

    };

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    function initialize() {

        $log.debug( "initializing app and data" );

        ogAPI.init( {
            appName:             "io.ourglass.nowserving",
            deviceModelCallback: processData,
            venueModelCallback:  processData,
            messageCallback:     inboundMessage,
            appType:             'mobile'
        } )
            .then( function ( data ) {
                $log.debug( "ogAPI init complete!" );
                processData();
            } )
            .catch( function ( err ) {
                $log.error( "Something failed: " + err );
            } );

    }

    initialize();

} );