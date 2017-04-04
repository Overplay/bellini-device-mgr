/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ($scope, $timeout, $http, $log, ogAPI, uibHelper ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { localRed: 0, localBlue: 0 };

        function initialize() {

            ogAPI.init( {
                appName: "io.ourglass.shuffleboard",
                sockets: true,
                modelCallback: undefined,
                messageCallback: inboundMessage,
                appType: 'mobile',
                deviceUDID: "test"
            })
                .then( function ( data ) {
                    $log.debug("shuffcon: init complete");
                    $scope.ui.localBlue = data.blue;
                    $scope.ui.localred = data.red;
                })
                .catch( function ( err ) {
                    $log.error("shuffcon: something bad happened: " + err);
                })

        }

        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        $scope.changeBlue = function ( by ) {

            $scope.ui.localBlue += by;
            if ( $scope.ui.localBlue < 0 ) $scope.ui.localBlue = 0;
            ogAPI.model.blue = $scope.ui.localBlue;
            ogAPI.save();

        };

        $scope.changeRed = function ( by ) {

            $scope.ui.localRed += by;
            if ( $scope.ui.localRed < 0 ) $scope.ui.localRed = 0;
            ogAPI.model.red = $scope.ui.localRed;
            ogAPI.save();

        };

        $scope.resetScores = function () {

            uibHelper.confirmModal('Confirm','Are you sure you want to clear the scores?', true)
                .then(function(){
                    ogAPI.model.red = 0;
                    ogAPI.model.blue = 0;
                    ogAPI.save();
                    $scope.ui = { localRed: 0, localBlue: 0 };
                })

        };


        $scope.move = function () {
            ogAPI.move();
        };

        initialize();

    });
