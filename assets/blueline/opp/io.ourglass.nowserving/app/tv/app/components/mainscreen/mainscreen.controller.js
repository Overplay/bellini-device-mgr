/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI ) {

    $log.debug( "mainScreenController has loaded" );

    $scope.ticketNumber = 0;

    function modelChanged( newValue ) {

        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        $scope.$apply();
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.ogsystem = msg;
    }

    function updateFromRemote() {

        ogAPI.init( {
            appName:      "io.ourglass.nowserving",
            sockets:      true,
            modelCallback: modelChanged,
            messageCallback: inboundMessage,
            appType:      'tv'
        })
            .then ( function ( d ) {
                $log.debug("ogAPI init complete!");
            })
            .catch( function ( err ) {
                $log.error("Something failed: " + err);
            })

    }

    updateFromRemote();

} );

