/**
 * Created by logansaso on 8/7/17.
 */
app.controller('settingsController', function ($scope, $log, nowServing, $state) {

	$log.debug("Loading settings controller");

	$scope.isVenueData = function isVenueData() {
		return nowServing.usingVenueData;
	};

	$scope.checkIcon = function () {

	};

	$scope.toggleSource = function () {
		nowServing.swapDataLocation();
		$state.go('home');
	};

	$scope.cancel = function () {
		$state.go('home');
	}

});