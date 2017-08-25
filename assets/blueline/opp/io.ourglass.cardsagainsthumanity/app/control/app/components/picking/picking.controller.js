app.controller('pickingController', function ($scope, cah, $state, uibHelper, $log, $timeout) {

	$log.debug("pickingController Started");

	if (!cah.stage) $state.go('start');

	if (cah.stage != 'picking') {
		$state.go(cah.stage);
	}

	$scope.player = cah.player;
	$scope.amJudge = function amJudge() {
		return cah.amJudge();
	};

	if ($scope.amJudge()) {
		uibHelper.headsupModal(
			"You are the Judge!",
			"You are the Judge, wait for players to submit their cards. When you see white cards, pick your favorite."
		);
	} else {
		uibHelper.headsupModal(
			"You are picking!",
			"Pick your favorite white card from your hand that matches the black card on the left."
		);
	}

	$scope.players = cah.players;
	$scope.player.cards = cah.getPlayerByName($scope.player.name).cards;
	$scope.roundPlayingCards = cah.roundPlayingCards;
	$scope.submittedCard = { text: '', id: -1 };
	$scope.roundJudgingCard = cah.roundJudgingCard;


	$scope.$on('MODEL_CHANGED', function () {
		$scope.players = cah.players;
		$scope.player = cah.player;
		$scope.roundPlayingCards = cah.roundPlayingCards;
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

	$scope.nextStage = function nextStage() {
		//We could check to see if everyone has submitted, but if someone is AFK let's not
		if (cah.roundPlayingCards.length == 0) {
			uibHelper.dryToast("No white cards have been submitted. Wait for some players to submit cards.");
			return;
		}
		$state.go('judging');
		cah.nextStage(); //This just does a model broadcast to go to judging for the other players
	};

	$scope.$on('JUDGING_PHASE', function () {
		$state.go('judging');
	});

});