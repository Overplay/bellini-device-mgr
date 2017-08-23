

app.controller('cahController', function ($scope, cah, $log, $timeout) {

	$scope.state = cah.stage;
	$scope.timeLeft = -1;

	$scope.$on('MODEL_CHANGED', function () {
		$scope.stage = cah.stage;
		$scope.roundJudgingCard = cah.roundJudgingCard;
		$scope.timeLeft = cah.timeLeft;

		if (cah.player) {
			$scope.player = cah.player;
		}

	});

	$scope.clearGame = cah.clearGame;


});