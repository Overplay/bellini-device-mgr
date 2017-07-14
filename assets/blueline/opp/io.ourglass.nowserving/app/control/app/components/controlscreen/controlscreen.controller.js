/**
 * Created by mkahn on 11/18/16.
 */

app.controller("ogNowServingController", function ($scope, $log, ogAPI, uibHelper, $timeout ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.ticketNumber = '---';

    function saveModel() {

        ogAPI.model = {ticketNumber: $scope.ticketNumber};

        ogAPI.save()
            .then( function ( response ) {
                $log.debug( "Save was cool" );
            } )
            .catch( function ( err ) {
                $log.error( "WTF?!?!?" );
                $scope.ticketNumber = "&*$!";
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

    $scope.setTicket = function () {

        $log.debug("Change Ticket Pressed ");
        uibHelper.stringEditModal(
            'Change Order Number?',
            'Do you really want to change?',
            $scope.ticketNumber,
            'order number'
        ).then(function (result) {
            if (!isNaN(result)) {
                $scope.ticketNumber = result;       
                saveModel();
            } else {
                uibHelper.dryToast("You must enter a number.");
            }
        }).catch(function (err) {
            $log.error(err);
        });

    };

    $scope.curtainDebug = function () {
        var curtain = uibHelper.curtainModal('Curtain');
        $timeout(function () { uibHelper.dismissCurtain(); }, 5000);
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

        ogAPI.init({
            appName: "io.ourglass.nowserving",
            sockets: true,
            modelCallback: modelChanged,
            messageCallback: inboundMessage,
            appType: 'mobile',
            deviceUDID: 'test'
        })
        .then(function (data) {
            $scope.ticketNumber = data.ticketNumber;
        })
        .catch(function (err) {
            $log.error("Something failed: " + err);
        });

    }




    initialize();

} );