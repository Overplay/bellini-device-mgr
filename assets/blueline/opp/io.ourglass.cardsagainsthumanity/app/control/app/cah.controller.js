

app.controller('cahController', function ($scope, cah, $log) {

	$scope.state = cah.stage;

	$scope.$on('GAME_START', function () {
		$scope.player = cah.player;
	});
	$scope.$on('MODEL_CHANGED', function () {
		$scope.stage = cah.stage;
		$scope.roundJudgingCard = cah.roundJudgingCard;

		if (cah.player) {
			$scope.player = cah.player;
		}


	});

	$scope.clearGame = cah.clearGame;

});