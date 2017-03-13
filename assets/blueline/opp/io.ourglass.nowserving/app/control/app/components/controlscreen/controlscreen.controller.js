/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogNowServingController", function ( $scope, $log, ogAPI ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.ticketNumber = 12456;

    function saveModel() {

        ogAPI.model = {ticketNumber: $scope.ticketNumber};

        ogAPI.save()
            .then( function ( response ) {
                $log.debug( "Save was cool" );
            } )
            .catch( function ( err ) {
                $log.error( "WTF?!?!?" );
                $scope.ticketNumber = "Error Talking to AB";
            } );
    }

    $scope.clear = function () {
    
        $log.debug( "Clear pressed" );
        $scope.ticketNumber = 0;
        // ogControllerModel.model = {ticketNumber: 0};

        saveModel();

    };

    $scope.incrementTicket = function () {
    
        $log.debug( "Increment pressed" );
        $scope.ticketNumber += 1;
        // ogControllerModel.model.ticketNumber = $scope.ticketNumber;

        saveModel();

    };

    function modelChanged( newValue ) {

        $log.info( "Model changed, yay!" );
        // $scope.ticketNumber = newValue.ticketNumber;
        // $scope.$apply();
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
        $scope.ogsystem = msg;
    }

    function initialize() {

        $log.debug( "initializing app and data" );
        // ogControllerModel.init( { appName: "io.ourglass.nowserving" } );
        // ogControllerModel.loadModel()
        //     .then( function ( latestData ) {
        //         $scope.ticketNumber = latestData.ticketNumber;
        //     } )
        //     .catch( function ( err ) {
        //         $log.error( "WTF?!?!?" );
        //         $scope.ticketNumber = "Error Talking to AB";
        //     } )

        ogAPI.init({
            appName: "io.ourglass.nowserving",
            sockets: true,
            modelCallback: modelChanged,
            messageCallback: inboundMessage,
            appType: 'mobile'
        })
            .then ( function ( data ) {
                $scope.ticketNumber = data.ticketNumber
            })
            .catch( function ( err ) {
                $log.error("Something failed: " + err);
            })

    }

    initialize();

} );