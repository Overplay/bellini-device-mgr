/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ticketNumber = 0;
    
    function modelChanged(newValue) {
        $scope.sourceVenue = newValue.usingVenueData;
        $log.info( "Model changed, yay!" );
        if(!$scope.sourceVenue) $scope.ticketNumber = newValue.ticketNumber;
        // $scope.$apply();
    }

    function venueModelChanged( newValue ) {

        $log.info( "Venue model changed, yay!" );
        // $scope.sourceVenue = true;
        $scope.sourceVenue = newValue.usingVenueData;    
        if ($scope.sourceVenue) $scope.ticketNumber = newValue.ticketNumber;
        // $scope.$apply();
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        // $scope.sourceVenue = false;
        $scope.ogsystem = msg;
    }

    function initialize() {

        ogAPI.init({
            appName: "io.ourglass.nowserving",
            deviceModelCallback: modelChanged,
            venueModelCallback: venueModelChanged,
            messageCallback: inboundMessage,
            appType: 'tv'
        })
        .then(function (data) {
            $log.debug("ogAPI init complete!");
            if (data.venue && data.device.usingVenueData) {
                $scope.ticketNumber = _.isFinite(data.venue.ticketNumber) ? data.venue.ticketNumber : '??';
            } else {
                $scope.ticketNumber = data.device.ticketNumber;
            }
            $scope.sourceVenue = data.device.usingVenueData;
        })
        .catch(function (err) {
            $log.error("Something failed: " + err);
        });

    }

    initialize();

} );

