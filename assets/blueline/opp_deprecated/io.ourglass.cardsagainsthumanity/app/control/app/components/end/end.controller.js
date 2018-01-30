app.controller('endController', function (cah, $scope, $log, $timeout, $state) {
	
	$log.debug('endController started');

	if (cah.stage != 'end') {
		$state.go('start');
	}
	
	cah.getWinner();

	$scope.playAgain = function () {
		// cah.clearController();
		cah.nextStage();
	};

	$scope.$on('MODEL_CHANGED', function () {
		$scope.winner = cah.winner;
	});

	$scope.$on('STAGE_CHANGE', function () {
		$state.go(cah.stage);
	});

});