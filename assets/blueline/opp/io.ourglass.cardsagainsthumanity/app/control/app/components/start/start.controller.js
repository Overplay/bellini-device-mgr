app.controller('startController', function ($scope, cah, $state, uibHelper, $log) {

	$scope.inLobby = false;
	$scope.players = cah.players;

	$scope.$on('PLAYER_CHANGED', function (event, player) {

		$scope.player = player;

	});

	$scope.$on('PLAYERS_CHANGED', function (event, players) {
		$scope.players = players;
	});

	$scope.addPlayer = function () {

		var playerName;

		uibHelper.stringEditModal(
			'Join Game',
			'Enter unique name below.',
			'',
			'unique name'
		).then(function (result) {
			cah.addPlayer(result);	
			$scope.inLobby = true;
			uibHelper.dryToast("Joined Game!", 3000); //This wont show if the other function throws an error.
		}).catch(function (err) {
			uibHelper.dryToast(err.message, 3000);
		});

		// $scope.inLobby
	};

	$scope.startGame = cah.startGame;

	$scope.$on('GAME_START', function () { 
		$state.go('picking');
	});



});