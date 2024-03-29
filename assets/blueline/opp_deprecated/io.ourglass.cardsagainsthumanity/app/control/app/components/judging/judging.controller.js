app.controller('judgingController', function ($scope, cah, $state, uibHelper, $log) {

	if (!cah.stage) {
		$state.go('start');
	}

	if (cah.stage != 'judging') {
		$state.go(cah.stage);
	}
	$scope.player = cah.player;
	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};

	if ($scope.amJudge()) {
		uibHelper.headsupModal(
			"You are the Judge!",
			"Pick your favorite card below."
		);
	} else {
		uibHelper.headsupModal(
			"Your card is being judged!",
			"Watch the TVs to see if your card will win the round!"
		);
	}

	$scope.roundPlayingCards = cah.roundPlayingCards;
	$scope.roundJudgingCard = cah.roundJudgingCard;
	$scope.players = cah.players;
	$scope.findPlayedCard = function findPlayedCard() {
		return _.find($scope.roundPlayingCards, function (card) {
			return $scope.player.id == card.submittedBy.id;
		});
	};

	$scope.playedCard = $scope.findPlayedCard();	

	$scope.findJudge = function findJudge() {
		return cah.getPlayerById(cah.judgeIndex % cah.players.length);
	};

	$scope.confirmChoice = function confirmChoice(card) {
		uibHelper.confirmModal(
			'Choose Winning Card',
			'Are you sure you want to choose "' + card.text + '"',
			card.id
		).then(function () {

			cah.pickWinningRoundCard(card);
			uibHelper.dryToast("The winner was " + card.submittedBy.name);
			cah.nextStage();
			
			// if (cah.getWinner()) {
			// 	$state.go('end');
			// } else {
			// 	$state.go('picking');
			// }
			//Give all players who weren't the judge a new white card.
			//Go back to picking phase (make sure to assign new black card)

			})
			.catch(function (err) {
			if (err.message != "cancled") {
				uibHelper.dryToast("Card not chosen.");
				$log.error("Card Confirm Error:", err);
			}

		});
	};

	$scope.$on('STAGE_CHANGE', function () {
		if (cah.stage != 'judging') {
			$state.go(cah.stage);
		}
	});

	// $scope.$on('MODEL_CHANGED', function () {

	// 	if (cah.stage != 'picking') {

	// 		if (cah.getWinner()) {
	// 			$state.go('end');
	// 		} else {
	// 			$state.go('picking');
	// 		}

	// 	}

	// });

});