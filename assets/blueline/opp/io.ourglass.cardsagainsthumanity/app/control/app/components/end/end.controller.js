app.controller('endController', function (cah, $scope, $log, $timeout, $state) {
	
	$log.debug('endController started');

	if (cah.stage != 'end') {
		$state.go('start');
	}
	
	$scope.getWinner = cah.getWinner;
	
	$scope.playAgain = function () {
		cah.nextStage();
		$state.go('start');
		cah.clearGame();
	};

	$scope.$on('START_PHASE', function () {
		cah.player = {};
		$state.go('start');
	});
});