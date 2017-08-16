app.controller('pickingController', function ($scope, cah, $state, uibHelper, $log, $timeout) {

	$log.debug("pickingController Started");

	if (cah.stage != 'picking') {
		$state.go('start');
	}

	$scope.player = cah.player;
	$scope.players = cah.players;
	$scope.player.cards = cah.getPlayerById($scope.player.id).cards;
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

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
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