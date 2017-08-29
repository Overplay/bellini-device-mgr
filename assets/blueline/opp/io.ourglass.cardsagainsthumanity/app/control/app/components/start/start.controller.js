app.controller('startController', function ($scope, cah, $state, uibHelper, $log) {

	uibHelper.headsupModal(
		"Welcome to Cards Against Humanity!",
		"This game requires 3 players. The start button will be clickable when at least 3 people have joined. Rounds will progress automatically. Keep an eye on the timing bar at the bottom of your window to see how long until a round progresses. Make sure to pay attention when you're about to judge."
	);



	$scope.inLobby = false;
	$scope.players = cah.players;	

	$scope.$on('MODEL_CHANGED', function () {
		$scope.players = cah.players;
		$scope.player = cah.player;

	});

	$scope.$on('STAGE_CHANGE', function () {
		if (cah.stage != 'start' && $scope.inLobby) {
			$state.go(cah.stage);
		}
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

	
	$scope.nextStage = cah.nextStage;
	


});