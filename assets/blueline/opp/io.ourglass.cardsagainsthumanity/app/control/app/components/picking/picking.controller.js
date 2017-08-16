app.controller('pickingController', function ($scope, cah, $state, uibHelper, $log) {

	$log.debug("pickingController Started");

	if (cah.stage != 'picking') {
		$state.go('start');
	}

	$scope.player = cah.player;
	$scope.players = cah.players;
	$scope.roundPlayingCards = cah.roundPlayingCards;
	$scope.submittedCard = { text: '', id: -1 };
	$scope.roundJudgingCard = cah.roundJudgingCard;

	$scope.$on('MODEL_CHANGED', function () {
		$scope.players = cah.players;
		$scope.roundPlayingCards = cah.roundPlayingCards;
		$scope.player = cah.player;
		$scope.roundJudgingCard = cah.roundJudgingCard;
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
			if (err.message != "cancled") {
				uibHelper.dryToast("Card not submitted.");
				$log.error(err);
			}

		});
	};

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};

	$scope.nextStage = function nextStage() {
		//We could check to see if everyone has submitted, but if someone is AFK let's not
		$state.go('judging');
		cah.nextStage(); //This just does a model broadcast to go to judging for the other players
	};

	$scope.$on('JUDGING_PHASE', function () {
		$state.go('judging');
	});

});