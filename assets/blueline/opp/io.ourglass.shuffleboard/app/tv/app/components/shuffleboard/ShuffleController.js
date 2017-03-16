/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffleController",
    function ($scope, ogAPI, $log ) {

        console.log( "Loading shuffleController(TV Blueline)" );

        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        var _remoteScore = {};
        
        function updateLocalScore() {

            var animRed = $scope.score.red != _remoteScore.red;
            var animBlue = $scope.score.blue != _remoteScore.blue;

            $scope.score.red = _remoteScore.red || 0;
            $scope.score.blue = _remoteScore.blue || 0;


            if ( animRed ) {
                $scope.score.redHighlight = true;
                $timeout( function () { $scope.score.redHighlight = false}, 500 );
            }

            if ( animBlue ) {
                $scope.score.blueHighlight = true;
                $timeout( function () { $scope.score.blueHighlight = false}, 500 );
            }
        }

        function modelChanged( data ) {
            _remoteScore = data;
            updateLocalScore();
        }

        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        function initialize() {

            ogAPI.init({
                appName: "io.ourglass.shuffleboard",
                sockets: true,
                modelCallback: modelChanged,
                messageCallback: inboundMessage, //don't need
                appType: 'tv',
                deviceUDID: 'test'
            } )
                .then( function ( data ) {
                    $log.debug( "ogAPI init complete!" );
                    _remoteScore = data;

                } )
                .catch( function ( err ) {
                    $log.error( "That's not right!" );
                } )

        }

        initialize()

    } );
