app.controller("crawlerController", ["$scope", "ogCrawler", function ($scope, ogCrawler) {
	$scope.ui = { tab: 'MESSAGES' };

	$scope.swapDataLocation = ogCrawler.swapDataLocation;
	
	$scope.update = ogCrawler.update;
	$scope.useVenueData = ogCrawler.useVenueData;
	

	$scope.$on('UPDATE', function () {
		$scope.useVenueData = ogCrawler.useVenueData;
	});


}]);