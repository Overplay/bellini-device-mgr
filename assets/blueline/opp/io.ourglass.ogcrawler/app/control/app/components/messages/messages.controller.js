app.controller("messagesController", ["$scope", "ogCrawler", function($scope, ogCrawler){

	$scope.messages = ogCrawler.messages;
	$scope.newMessage = ogCrawler.newMessage;
	$scope.delMessage = ogCrawler.delMessage;

	$scope.$on('UPDATE', function () { 
		$scope.messages = ogCrawler.messages;
	})

}]);