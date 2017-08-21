app.controller("upcomingController", ["$scope", "ogCrawler", function ($scope, ogCrawler) {

	$scope.comingUpMessages = ogCrawler.comingUpMessages;

	$scope.newComingUpMessage = ogCrawler.newComingUpMessage;
	$scope.delComingUpMessage = ogCrawler.delComingUpMessage;

	$scope.$on('UPDATE', function () { 
		$scope.comingUpMessages = ogCrawler.comingUpMessages;
	})

}]);