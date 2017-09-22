/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ticketNumber = 0;

    function setTicketNumber() {
        $log.info( "Model changed, yay!" );
        $scope.sourceVenue = ogAPI.model.useVenueData;
        $scope.ticketNumber = $scope.sourceVenue ?
            ogAPI.venueModel.ticketNumber :
            ogAPI.model.ticketNumber;
    }


    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    function initialize() {

        ogAPI.init( {
            appName:             "io.ourglass.nowserving",
            deviceModelCallback: setTicketNumber,
            venueModelCallback:  setTicketNumber,
            messageCallback:     inboundMessage,
            appType:             'tv'
        } )
            .then( function ( data ) {
                $log.debug( "ogAPI init complete!" );
                setTicketNumber();
            } )
            .catch( function ( err ) {
                $log.error( "Something failed: " + err );
            } )

    }

    initialize();

} );

