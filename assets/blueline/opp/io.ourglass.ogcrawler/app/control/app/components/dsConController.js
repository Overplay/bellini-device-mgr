/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, ogAPI, uibHelper, $log, dataModel ) {

        dataModel.init();

        $scope.messages = [];
        $scope.comingUpMessages = [];
        $scope.twitterQueries = [];
        $scope.ui = { tab: "MESSAGES" };

        $scope.tabs = [ 'Messages', 'Coming Up', 'Twitter' ];

        $scope.$on('DATA_SOURCE_CHANGED', function(){
            $log.debug("Received inbound source change message");
            var d = dataModel.getData();
            $scope.messages = d.messages;
            $scope.twitterQueries = d.twitterQueries;
            $scope.hideTVTweets = d.hideTVTweets;

        });



        $scope.getSelectedTabTitle = function () {
            return $scope.tabs[$ionicTabsDelegate.selectedIndex()];
        };

        $scope.getTabURI = function (tab) {
            return tab.toLowerCase().replace(' ', '');
        };

        $scope.newMessage = function () {
            $scope.messages.push("");
            $scope.update();
        };

        $scope.newComingUpMessage = function () {
            $scope.comingUpMessages.push("");
            $scope.update();
        };

        $scope.newTwitterQuery = function () {
            $scope.twitterQueries.push("");
            //$scope.update();
        };

        $scope.delMessage = function (index) {
            $scope.messages.splice(index, 1);
            $scope.update();
        };

        $scope.swapDataLocation = function () {
            $scope.useVenueData = !$scope.useVenueData;
            dataModel.setUseVenue($scope.useVenueData);
        };

        $scope.delComingUpMessage = function (index) {
            $scope.comingUpMessages.splice(index, 1);
            $scope.update();
        };

        $scope.delTwitterQuery = function (index) {
            $scope.twitterQueries.splice(index, 1);
            $scope.update();
        };

        $scope.update = function () {
            dataModel.setHzMessages( $scope.messages );
            dataModel.setTwitterQueries( $scope.twitterQueries );
            dataModel.setHideTVTweets($scope.hideTVTweets)
            
            uibHelper.curtainModal('Saving...');

            dataModel.save()
                .then( function(){
                    uibHelper.dryToast('Saved');
                })
                .catch( function(){
                    uibHelper.dryToast('Error');
                })
                .finally( uibHelper.dismissCurtain );

        };


        $scope.toggleTVTweets = function(){
            $log.debug("Toggling tweets");
            $scope.hideTVTweets =! $scope.hideTVTweets;
            dataModel.setHideTVTweets($scope.hideTVTweets);
        };


    });
