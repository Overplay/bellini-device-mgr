/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, uibHelper ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ogsystem = ogAPI.getOGSystem();

    function modelChanged( newValue ) {

        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        $scope.ogsystem = newValue;

    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.ogsystem = msg;

    }

    // MAK note. Playing with arrow functions. This'll probably fail in Android browser :)
    function testDirectModelLoad(){
        ogAPI.loadModel()
            .then( data => $log.info("Direct model load yielded: "+JSON.stringify(data)) )
            .catch( err => $log.error("Direct model load failed: "+ JSON.stringify(err)) )
    }


    ogAPI.init( {
        appName:         "io.ourglass.mktest",
        modelCallback:   modelChanged,
        messageCallback: inboundMessage,
        appType:         'tv'
    } )
        .then( function ( d ) {
            $log.debug( "ogAPI init complete!" )
            uibHelper.dryToast( "Model Init OK", 2000 );
            testDirectModelLoad();

        } )
        .catch( function ( err ) {
            $log.error( "That's not right!" );
            uibHelper.dryToast( "Model Init FAIL!", 2000 );
        } )


} )
;

