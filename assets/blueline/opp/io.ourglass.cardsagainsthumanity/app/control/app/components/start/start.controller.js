app.controller('startController', function ($scope, cah) {

	$scope.players = {};

	$scope.$on("PLAYER_CHANGE", function (event, { players }) {
		$scope.players = players;
	});



});