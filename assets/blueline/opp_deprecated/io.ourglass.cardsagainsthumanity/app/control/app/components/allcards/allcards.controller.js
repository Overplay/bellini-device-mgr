app.controller('allCardsController', function ($scope, cah) {

	console.log("All cards conroller entered");

	$scope.availCards = cah.availableCards;
	$scope.letsLog = function () {
		console.log($scope.availCards, cah.availableCards);
	};
});