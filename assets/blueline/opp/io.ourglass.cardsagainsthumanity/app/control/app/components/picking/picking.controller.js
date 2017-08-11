app.controller('pickingController', function ($scope, cah, $state, uibHelper, $log) {

	$log.debug("pickingController Started");

	if (!cah.gameInProgress) {
		$state.go('start');
	}

	$scope.player = cah.player;
	$scope.players = cah.players;
	$scope.roundPlayingCards = cah.roundPlayingCards;

	$scope.$on('MODEL_CHANGED', function ({ players, roundPlayingCards }) {
		$scope.players = players;
		$scope.roundPlayingCards = roundPlayingCards;
		$scope.player = cah.player;
	});

	$scope.findJudge = function findJudge() {
		return cah.getPlayerById(cah.judgeIndex % cah.players.length).name;
	};

	$scope.confirmCardChoice = function confirmCardChoice(card) {
		uibHelper.confirmModal(
			'Pick Card',
			'Are you sure you want to pick "' + card.text + '"',
			card.id
		);
	};

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};

});