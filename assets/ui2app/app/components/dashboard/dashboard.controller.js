app.controller('ogDeviceNumberTileController', [ '$scope', '$log', 'ogdevices', function ($scope, $log, ogdevices) {

	$log.debug("Loading ogDeviceNumberTileController");
    $scope.ogdevices = ogdevices;

    var now = new Date();
    $scope.activeDevices = _.remove (ogdevices, function(device) {
        var lastContact = new Date(device.lastContact);
        var diff = Math.abs(now - lastContact);
        return diff < (5*60*1000);
    });

    $scope.lastContactAgo = function(){
        if (!$scope.lastContact)
            return 'never';

        return moment($scope.lastContact).fromNow();
    };

    $scope.countActiveDevice = function(){
        for(var i=0;i<ogdevices.length;i++) {
            time = device.lastContactAgo();
            if (time<5){
                ++ogdeviceActiveCount;
            }
        }
    }

} ] );