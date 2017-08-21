app.controller("crawlerController", ["$scope", "ogCrawler", function ($scope, ogCrawler) {
	$scope.ui = { tab: 'MESSAGES' };

	$scope.swapDataLocation = ogCrawler.swapDataLocation;
	
	$scope.update = ogCrawler.update;


}]);