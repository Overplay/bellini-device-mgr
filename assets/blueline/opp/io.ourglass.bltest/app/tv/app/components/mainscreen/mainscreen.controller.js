/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, $window ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ogsystem = ogAPI.getOGSystem();

    function modelChanged( newValue ) {

        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        $scope.$apply();
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }


    ogAPI.init( {
        appName:         "io.ourglass.bltest",
        modelCallback:   modelChanged,
        messageCallback: inboundMessage,
        appType:         'tv'
    } )
        .then( function ( d ) {
            $log.debug( "ogAPI init complete!" )
        } )
        .catch( function ( err ) {
            $log.error( "That's not right!" );
        } )


} )
;

