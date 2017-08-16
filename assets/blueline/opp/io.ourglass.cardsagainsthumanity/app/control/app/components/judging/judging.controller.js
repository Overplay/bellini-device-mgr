app.controller('judgingController', function ($scope, cah) {

	if (cah.stage != 'judging') {
		$state.go('start');
	}

	var roundPlayingCards = cah.roundPlayingCards;
	$scope.player = cah.player;

	$scope.findCard = function findCard() {
		return _.find(roundPlayingCards, function (card) {
			return player.id == card.submittedBy.id;
		});
	};

	$scope.amJudge = function amJudge() {
		return $scope.player.id == cah.judgeIndex % cah.players.length;
	};
	$scope.findJudge = function findJudge() {
		return cah.getPlayerById(cah.judgeIndex % cah.players.length).name;
	};

});