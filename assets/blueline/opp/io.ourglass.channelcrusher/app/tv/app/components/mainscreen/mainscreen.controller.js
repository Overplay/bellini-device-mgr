/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, $timeout ) {

    $log.debug( "mainScreenController has loaded" );

    var DELAY = 10000;

    var safeChannels = [ 202, 206, 620, 2, 207, 44, 4,5,7,9,212,11,14,219,20,22,36, 38, 42, 43, 54, 217, 218 ];
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

        $scope.channelNumber = _.shuffle(safeChannels);
        ogAPI.changeChannel($scope.channelNumber);
        $timeout(changeChannel, DELAY );

    }

    initialize();

} );

