app.controller('ogDeviceNumberTileController', function ($scope, $log, ogdevices) {

	$log.debug("Loading ogDeviceNumberTileController");
	$scope.ogdevicesLength = ogdevices.length;
    $scope.ogdeviceActiveCount;

    this.lastContactAgo = function(){
        if (!this.lastContact)
            return 'never';

        return moment(this.lastContact).fromNow();
    };

    function countActiveDevice(){
        for(var i=0;i<ogdevices.length;i++) {
            time = device.lastContactAgo();
            if (time<5){
                ++ogdeviceActiveCount;
            }
        }
    }
});