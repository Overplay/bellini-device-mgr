/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, ogAPI, uibHelper, $log) {

        $scope.tabs = ['Messages', 'Coming Up', 'Twitter'];
        $scope.ui = { isLoaded: false, isAdmin: false };

        var user;

        $scope.getSelectedTabTitle = function () {
            return $scope.tabs[$ionicTabsDelegate.selectedIndex()];
        };

        $scope.getTabURI = function (tab) {
            return tab.toLowerCase().replace(' ', '');
        };

        function processModel( modelData ){

            $scope.model = modelData;
            $scope.localAnswers = modelData.scores[user.id];
            if (!$scope.localAnswers){
                $scope.localAnswers = _.fill( Array( 10 ), '' );
            };

        }

        function modelUpdate( data ) {
            $log.debug("There was a model update, but I don't give a shit.");


        }

        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        function initialize() {

            ogAPI.init({
                appType: 'mobile',
                appName: "io.ourglass.ogmeetus",
                endpoint: "control",
                deviceUDID: "test",
                modelCallback: modelUpdate,
                messageCallback: inboundMessage
            })
                .then( function ( data ) {
                    $log.debug("crawler control: init complete");
                    $scope.permissions = ogAPI.getPermissions();
                    $scope.ui.isAdmin = !$scope.permissions || ( $scope.permissions.manager || $scope.permissions.owner );
                    $scope.ui.isLoaded = true;
                    user = ogAPI.getUser();
                    $scope.ui.name =  user.firstName;
                    processModel( data );
                })
                .catch( function ( err ) {
                    $log.error("crawler controller: something bad happened: " + err);
                })
        }



        $scope.update = function () {

            uibHelper.curtainModal( 'Saving...' );

            ogAPI.getModel()
                .then(function(latest){
                    latest.scores[user.id] = $scope.localAnswers;
                    return ogAPI.save();
                })
                .finally( uibHelper.dismissCurtain );

            
        };



        initialize();

    });
