app.controller('judgingController', function ($scope, cah, $state, uibHelper, $log) {

	if (cah.stage != 'judging') {
		$state.go('start');
	}

	$scope.roundPlayingCards = cah.roundPlayingCards;
	$scope.roundJudgingCard = cah.roundJudgingCard;
	$scope.player = cah.player;
	$scope.players = cah.players;
	$scope.findCard = function findCard() {
		return _.find($scope.roundPlayingCards, function (card) {
			return $scope.player.id == card.submittedBy.id;
		});
	};

	$scope.playedCard = $scope.findCard();	

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};
	$scope.findJudge = function findJudge() {
		return cah.getPlayerById(cah.judgeIndex % cah.players.length).name;
	};

	$scope.confirmChoice = function confirmChoice(card) {
		uibHelper.confirmModal(
			'Choose Winning Card',
			'Are you sure you want to choose "' + card.text + '"',
			card.id
		).then(function () {

			cah.addBlackCardToPlayerById(card.submittedBy.id, $scope.roundJudgingCard);
			uibHelper.dryToast("The winner was " + card.submittedBy.name);
			cah.nextStage();
			
			if (cah.getWinner()) {
				$state.go('end');
			} else {
				$state.go('picking');
			}
			//Give all players who weren't the judge a new white card.
			//Go back to picking phase (make sure to assign new black card)

		}).catch(function (err) {
			if (err.message != "cancled") {
				uibHelper.dryToast("Card not chosen.");
				$log.error(err);
			}

		});
	};

	$scope.$on('PICKING_PHASE', function () {
		$state.go('picking');
	});

	$scope.$on('END_PHASE', function () {
		$state.go('end');
	});

});