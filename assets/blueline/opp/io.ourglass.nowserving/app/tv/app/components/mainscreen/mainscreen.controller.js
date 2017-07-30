/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ticketNumber = 0;

    function modelChanged( newValue ) {
        $scope.sourceVenue = false;
        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        // $scope.$apply();
    }

    function venueModelChanged( newValue ) {

        $log.info( "Venue model changed, yay!" );
        $scope.sourceVenue = true;
        $scope.ticketNumber = newValue.ticketNumber;
        // $scope.$apply();
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.sourceVenue = false;
        $scope.ogsystem = msg;
    }

    function initialize() {

        ogAPI.init( {
            appName:      "io.ourglass.nowserving",
            deviceModelCallback: modelChanged,
            venueModelCallback: venueModelChanged,
            messageCallback: inboundMessage,
            appType:      'tv'
        })
            .then ( function ( data ) {
                $log.debug( "ogAPI init complete!" );
                if (data.venue && data.device.useVenueData){
                    $scope.ticketNumber = data.venue.ticketNumber || '??';
                } else {
                    $scope.ticketNumber = data.device.ticketNumber;
                }
            })
            .catch( function ( err ) {
                $log.error("Something failed: " + err);
            })

    }

    initialize();

} );

