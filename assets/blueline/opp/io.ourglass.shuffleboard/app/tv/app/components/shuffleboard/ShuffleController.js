/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffleController",
    function ( $scope, ogAPI, $log, $timeout ) {

        console.log( "Loading shuffleController(TV Blueline)" );

        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        var _remoteScore = {};

        function updateLocalScore() {

            var animRed = $scope.score.red !== ogAPI.model.red;
            var animBlue = $scope.score.blue !== ogAPI.model.blue;

            $scope.score.red = ogAPI.model.red || 0;
            $scope.score.blue = ogAPI.model.blue || 0;


            if ( animRed ) {
                $scope.score.redHighlight = true;
                $timeout( function () { $scope.score.redHighlight = false}, 500 );
            }

            if ( animBlue ) {
                $scope.score.blueHighlight = true;
                $timeout( function () { $scope.score.blueHighlight = false}, 500 );
            }
        }


        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        function initialize() {

            ogAPI.init( {
                appName:             "io.ourglass.shuffleboard",
                deviceModelCallback: updateLocalScore,
                messageCallback:     inboundMessage, //don't need
                appType:             'tv'
            } )
                .then( function () {
                    $log.debug( "ogAPI init complete!" );
                    _remoteScore = ogAPI.model;
                } )
                .catch( function ( err ) {
                    $log.error( "That's not right!" );
                } )

        }

        initialize()

    } );
