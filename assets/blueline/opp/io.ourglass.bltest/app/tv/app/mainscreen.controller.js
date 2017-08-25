/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, $interval ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.obMessage = { numberFromTV: 0 };


    function modelChanged( newValue ) {
        $log.info( "Model changed, yay!" );
    }

    function venueModelChanged( newValue ) {

        $log.info( "Venue Model changed, yay!" );

    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.inboundMessage = msg;

    }

    $scope.getDeviceModel = function(){
        return ogAPI.model;
    }

    $scope.getVenueModel = function () {
        return ogAPI.venueModel;
    }

    ogAPI.init( {
        appName:             "io.ourglass.bltest",
        deviceModelCallback: modelChanged,
        venueModelCallback:  venueModelChanged,
        messageCallback:     inboundMessage,
        appType:             'tv'
    } )
        .then( function ( d ) {
            $log.debug( "ogAPI init complete!" )
            $scope.ogsystem = ogAPI.getOGSystem();
            $scope.udid = ogAPI.getDeviceUDID();

            ogAPI.model = { deviceData: { red: 0, blue: 10 } };
            ogAPI.save();

            ogAPI.venueModel = { venueData: { green: 99, yellow: 66 } };
            ogAPI.save( 'venue' );

            startSendingMessages();

        } )
        .catch( function ( err ) {
            $log.error( "That's not right!" );
        } )

    function startSendingMessages(){

        $interval( function(){

            $scope.obMessage.numberFromTV++;
            ogAPI.sendMessageToAppRoom($scope.obMessage);

        }, 5000 );
    }

} )
;

