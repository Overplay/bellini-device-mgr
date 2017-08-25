/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogMAKBLTestMainController", function ( $scope, $log, ogAPI, uibHelper ) {

    $log.debug( "loaded ogMAKBLTestMainController" );

    $scope.hideAds = true;

    $scope.ogsystem = ogAPI.getOGSystem();

    function modelChanged( newValue ) {
        $log.info( "Model changed, yay!" );
        $scope.model = newValue;
    }

    function venueModelChanged( newValue ) {
        $log.info( "Venue model changed, yay!" );
        $scope.venueModel = newValue;
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.inboundMsg = msg;
    }

    function testDirectModelLoad() {
        ogAPI.loadModel()
            .then( function ( data ) {
                $log.info( "Direct model load yielded: " + JSON.stringify( data ));
            } )
            .catch( function(err){
                $log.error( "Direct model load failed: " + JSON.stringify( err ) )
            } )
    }

    function initialize() {

        $log.debug( "initializing app and data" );

        ogAPI.init( {
            appName:             "io.ourglass.mktest",
            deviceModelCallback: modelChanged,
            venueModelCallback:  venueModelChanged,
            messageCallback:     inboundMessage,
            appType:             'mobile'
        } )
            .then( function ( data ) {
                $log.debug( "ogAPI init complete!" );
                $scope.model = data.device;
                $scope.venueModel = data.venue;
            } )
            .catch( function ( err ) {
                $log.error( "Something failed: " + err );
            } );

    }

    initialize();
    
    $scope.add = function(amt){
        ogAPI.model.mydata.value += amt;
        ogAPI.model.mydata.setBy = 'control';
        ogAPI.save();
    }
    
    $scope.sendDeviceDM = function(){
        ogAPI.sendMessageToDeviceRoom({ cocktail: 'Bellini', size: "medium"});
    }

} );