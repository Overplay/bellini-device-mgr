

app.controller('cahController', function ($scope, cah, $log) {

	$scope.$on('GAME_START', function () {
		$scope.player = cah.getPlayerById($scope.player.id);
	});
	$scope.$on('MODEL_CHANGED', function () {
		$scope.player = cah.player;
		$log.debug("MODEL CHANGE EVENT", $scope.player);
		$scope.player.cards = cah.getPlayerById($scope.player.id).cards;
	});

	$scope.clearGame = cah.clearGame;

});