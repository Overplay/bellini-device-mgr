app.controller('twitterController', ['$scope', "ogCrawler", function($scope, ogCrawler){

	$scope.hideTVTweets = ogCrawler.hideTVTweets;
	$scope.twitterQueries = ogCrawler.twitterQueries;

	$scope.delTwitterQuery = ogCrawler.delTwitterQuery;
	$scope.toggleTVTweets = ogCrawler.toggleTVTweets;
	$scope.newTwitterQuery = ogCrawler.newTwitterQuery;

	$scope.$on('UPDATE', function () {
		$scope.hideTVTweets = ogCrawler.hideTVTweets;
		$scope.twitterQueries = ogCrawler.twitterQueries;
	});

}]);