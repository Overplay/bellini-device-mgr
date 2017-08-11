

app.controller('cahController', function ($scope, cah) {

	

	$scope.$on("PLAYER_CHANGED", function (event, player) {
		$scope.player = player;
	});

	$scope.clearGame = cah.clearGame;

});