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

    function updateFromRemote() {

        ogAPI.init( {
            appName:      "io.ourglass.nowserving",
            sockets:      true,
            modelCallback: modelChanged,
            appType:      'tv'
        } );

    }

    updateFromRemote();

} );

