app.controller('startController', function ($scope, cah, $state, uibHelper, $log) {

	$scope.inLobby = false;
	$scope.players = cah.players;	

	$scope.$on('MODEL_CHANGED', function () {
		$scope.players = cah.players;
		$scope.player = cah.player;
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


	$scope.startGame = function startGame() {
		cah.nextStage();
		$state.go('picking');
	};

	$scope.$on('PICKING_PHASE', function () { 
		$state.go('picking');
	});

	$scope.clearGame = cah.clearGame;


});