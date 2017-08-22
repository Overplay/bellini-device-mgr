

app.controller('cahController', function ($scope, cah, $log, $timeout) {

	$scope.state = cah.stage;

	$scope.$on('PICKING_PHASE', function () {
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