app.controller('ogDeviceNumberTileController', function ($scope, $log, ogdevices) {

	$log.debug("Loading ogDeviceNumberTileController");
	$scope.ogdevicesLength = ogdevices.length;

});