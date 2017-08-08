/**
 * Created by logansaso on 8/7/17.
 */
app.controller('settingsController', function ($scope, $log, nowServing, $state) {

	$log.debug("Loading settings controller");

	$scope.usingVenueData = nowServing.usingVenueData || false;
	$scope.toggleSource = function () {
		nowServing.swapDataLocation();
		$scope.usingVenueData = nowServing.usingVenueData;
		// $state.go('home');
	};

	$scope.done = function () {
		$state.go('home');
	};

	$scope.checkIcon = function () {
		return $scope.usingVenueData ? 'glyphicon-check' : 'glyphicon-unchecked';
	};

	$scope.$on('DATA_LOADED', function (event, { usingVenueData }) {
		$scope.usingVenueData = usingVenueData;
	});

});