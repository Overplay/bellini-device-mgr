app.controller('startController', function ($scope, cah) {



	$scope.$on('PLAYER_CHANGED', function (event, player) {

		$scope.player = player;

	});

	$scope.$on('PLAYERS_CHANGED', function (event, players) {
		$scope.players = players;
	});

	$scope.addPlayer = function () {
		if(!$scope.player) cah.addPlayer();
	}

	$scope.startGame = cah.startGame;

});