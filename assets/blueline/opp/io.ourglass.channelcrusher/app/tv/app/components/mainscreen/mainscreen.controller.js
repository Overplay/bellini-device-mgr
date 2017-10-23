/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, $timeout ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.channelNumber = 2;

    function setChannelNumber() {
        $log.info( "Model changed, yay!" );
        $scope.sourceVenue = ogAPI.model.useVenueData;
        $scope.channelNumber = $scope.sourceVenue ?
            ogAPI.venueModel.channelNumber :
            ogAPI.model.channelNumber;
    }


    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    function initialize() {

        ogAPI.init( {
            appName:             "io.ourglass.channelcrusher",
            deviceModelCallback: setChannelNumber,
            venueModelCallback: setChannelNumber,
            messageCallback:     inboundMessage,
            appType:             'tv'
        } )
            .then( function ( data ) {
                $log.debug( "ogAPI init complete!" );
                setChannelNumber();
                $timeout( changeChannel, 1500 );

            } )
            .catch( function ( err ) {
                $log.error( "Something failed: " + err );
            } )

    }

    function changeChannel(){

        $scope.channelNumber = _.random(2, 700);
        ogAPI.changeChannel($scope.channelNumber);
        $timeout(changeChannel, 7500);

    }

    initialize();

} );

