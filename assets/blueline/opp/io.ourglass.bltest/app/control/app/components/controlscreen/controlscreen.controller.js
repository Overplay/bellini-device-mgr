/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogBLTestController", function ( $scope, $log, ogAPI, uibHelper ) {

    $log.debug( "loaded ogBLTestController" );

    $scope.obMessage = { fromPhone: '' };


    function modelChanged( newValue ) {
        $log.info( "Device model changed, yay!" );
    }

    function venueModelChanged( newValue ) {

        $log.info( "Venue Model changed, yay!" );

    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.inboundMessage = msg;

    }

    $scope.getDeviceModel = function () {
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


        } )
        .catch( function ( err ) {
            $log.error( "That's not right!" );
        } );

    $scope.sendMessage = function(){

        uibHelper.stringEditModal('Sned Message','Enter message below.', $scope.obMessage.fromPhone)
            .then( function(msg){
                $scope.obMessage.fromPhone = msg;
                ogAPI.sendMessageToAppRoom($scope.obMessage);
            })
        //ogAPI.sendMessageToAppRoom( $scope.obMessage );
    };

    $scope.changeDevModel = function(){
        ogAPI.model.deviceData.red++;
        ogAPI.model.deviceData.blue++;
        ogAPI.save();
    };

    $scope.changeVenueModel = function () {
        ogAPI.venueModel.venueData.green--;
        ogAPI.venueModel.venueData.yellow--;
        ogAPI.save('venue');
    }


} );