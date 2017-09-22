/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ($scope, $timeout, $http, $log, ogAPI, uibHelper ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { localRed: 0, localBlue: 0 };

        function updateScores(){
            $scope.ui.localBlue = ogAPI.model.blue;
            $scope.ui.localRed = ogAPI.model.red;
        }

        function save(){
            ogAPI.saveDeviceModel()
                .then( updateScores )
                .catch( function ( err ) {
                    uibHelper.dryToast( 'Error Saving Data' )
                } );
        }

        function initialize() {

            ogAPI.init( {
                appName: "io.ourglass.shuffleboard",
                messageCallback: inboundMessage,
                appType: 'mobile',
            })
                .then( function () {
                    $log.debug("shuffcon: init complete");
                    updateScores();
                })
                .catch( function ( err ) {
                    $log.error("shuffcon: something bad happened: " + err);
                })

        }

        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        $scope.changeBlue = function ( by ) {
            ogAPI.model.blue += by;
            if ( ogAPI.model.blue < 0 ) ogAPI.model.blue = 0;
            save();
        };

        $scope.changeRed = function ( by ) {
            ogAPI.model.red += by;
            if ( ogAPI.model.red < 0 ) ogAPI.model.red = 0;
            save();
        };

        $scope.resetScores = function () {

            uibHelper.confirmModal('Confirm','Are you sure you want to clear the scores?', true)
                .then(function(){
                    ogAPI.model.red = 0;
                    ogAPI.model.blue = 0;
                    save();
                })

        };


        $scope.move = function () {
            ogAPI.move();
        };

        initialize();

    });
