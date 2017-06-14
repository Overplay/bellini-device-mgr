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

        function modelUpdate( data ) {

            $scope.model = data;
            $scope.myanswers = _.find(data.scores, { id: user.id });

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
                    modelUpdate( data );
                })
                .catch( function ( err ) {
                    $log.error("crawler controller: something bad happened: " + err);
                })
        }



        $scope.update = function () {
            // ogAPI.model.messages = $scope.messages;
            // ogAPI.model.comingUpMessages = $scope.comingUpMessages;
            //
            // ogAPI.model.twitterQueries = $scope.twitterQueries;
            // ogAPI.model.hideTVTweets = $scope.hideTVTweets;
            
            uibHelper.curtainModal('Saving...');
            ogAPI.save()
                .then( function(){
                    return ogAPI.updateTwitterQuery( ogAPI.model.twitterQueries );
                })
                .finally( uibHelper.dismissCurtain );
            
        };



        initialize();

    });
