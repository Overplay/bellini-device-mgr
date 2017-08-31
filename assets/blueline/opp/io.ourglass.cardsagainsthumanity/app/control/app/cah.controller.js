

app.controller('cahController', function ($scope, cah, $log, $timeout, $state) {

	
	$scope.state = cah.stage;
	$scope.timeLeftPercent = -1;

	$scope.$on('MODEL_CHANGED', function () {
		$scope.stage = cah.stage;
		$scope.roundJudgingCard = cah.roundJudgingCard;
		$scope.timeLeftPercent = cah.timeLeftPercent;
		$scope.timeLeft = cah.timeLeft;

		if (cah.player) {
			$scope.player = cah.player;
		}

	});

	$scope.$on('RESTART', function () { 
		$state.go('start');
	})

	$scope.nextStage = cah.nextStage;
	$scope.clearGame = cah.clearGame;
	$scope.debugInfo = cah.debugInfo;


});