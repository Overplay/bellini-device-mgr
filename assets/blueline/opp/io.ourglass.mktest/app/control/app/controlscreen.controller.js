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

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.inboundMsg = msg;
    }

    // MAK note. Playing with arrow functions. This'll probably fail in Android browser :)
    function testDirectModelLoad() {
        ogAPI.loadModel()
            .then( data => $log.info( "Direct model load yielded: " + JSON.stringify( data ) ) )
            .catch( err => $log.error( "Direct model load failed: " + JSON.stringify( err ) ) )
    }


    ogAPI.init( {
        appName:         "io.ourglass.mktest",
        modelCallback:   modelChanged,
        messageCallback: inboundMessage,
        appType:         'mobile'
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
        
    
    $scope.add = function(amt){
        ogAPI.model.mydata.value += amt;
        ogAPI.model.mydata.setBy = 'control';
        ogAPI.save();
    }
    
    $scope.sendDeviceDM = function(){
        ogAPI.sendMessageToDeviceRoom({ cocktail: 'Bellini', size: "medium"});
    }

} );