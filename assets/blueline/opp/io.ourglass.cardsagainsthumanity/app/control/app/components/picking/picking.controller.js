app.controller('pickingController', function ($scope, cah, $state) {

	if (!cah.gameInProgress) {
		$state.go('start');
	}

	

});