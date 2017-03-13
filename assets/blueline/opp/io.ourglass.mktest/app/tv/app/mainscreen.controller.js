/**
 * Created by mkahn on 11/17/16.
 */

app.controller( "mainScreenController", function ( $scope, $log, ogAPI, uibHelper, $interval ) {

    $log.debug( "mainScreenController has loaded" );
    
    $scope.hideAds = true;

    $scope.ogsystem = ogAPI.getOGSystem();

    function modelChanged( newValue ) {
        $log.info( "Model changed, yay!" );
        $scope.model = newValue;
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.inboundMsg = msg;
        $scope.outboundMsg = { cocktail: 'shot', size: 'small', time: new Date() };
        ogAPI.sendMessageToDeviceRoom($scope.outboundMsg);
    }

    // MAK note. Playing with arrow functions. This'll probably fail in Android browser :)
    function testDirectModelLoad(){
        ogAPI.loadModel()
            .then( function(data){  $log.info("Direct model load yielded: "+JSON.stringify(data)) })
            .catch( function(err){ $log.error("Direct model load failed: "+ JSON.stringify(err)) })
    }

    function subtract(){
        ogAPI.model.mydata.value -= 1;
        ogAPI.model.mydata.setBy = 'TV';
        ogAPI.save();
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
            $interval(subtract, 5000);

        } )
        .catch( function ( err ) {
            $log.error( "That's not right!" );
            uibHelper.dryToast( "Model Init FAIL!", 2000 );
        } )


});

