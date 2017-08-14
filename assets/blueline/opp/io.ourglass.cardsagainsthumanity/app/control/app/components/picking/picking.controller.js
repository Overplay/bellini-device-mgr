app.controller('pickingController', function ($scope, cah, $state, uibHelper, $log) {

	$log.debug("pickingController Started");

	if (!cah.gameInProgress) {
		$state.go('start');
	}

	$scope.player = cah.player;
	$scope.players = cah.players;
	$scope.roundPlayingCards = cah.roundPlayingCards;
	$scope.submittedCard = {text: '', id: -1};

	$scope.$on('MODEL_CHANGED', function () {
		$scope.players = cah.players;
		$scope.roundPlayingCards = cah.roundPlayingCards;
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
		).then(function () { 
			if (!$scope.player) {
				uibHelper.dryToast("You cannot submit a card outside of a game.");
			}
			cah.submitCard(card, $scope.player);
			$scope.submittedCard = card;
		}).catch(function (err) {
			uibHelper.dryToast("An error occurred submitting your card.");
			$log.error(err);
		});
	};

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};

	$scope.endPick = function endPick() {
		//We could check to see if everyone has submitted, but if someone is AFK let's not

		$state.go('judging');
		cah.endPick(); //This just does a model broadcast to go to judging for the other players
	};

	$scope.$on('JUDGING_PHASE', function () {
		$state.go('judging');
	});

});