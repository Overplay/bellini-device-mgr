/**
 * Created by mkahn on 4/28/15.
 */

// Really does nothing much in this version
app.controller("conController",
    function ( $scope, $log, $state, ogAPI, $timeout ) {

        $log.info("Loading conController");

        $state.go("dashboard");

        $scope.deviceUDID = ogAPI.getDeviceUDID();
        $log.debug("UDID is: "+$scope.deviceUDID);

        $timeout( function(){

            JSMpeg.CreateVideoElements();

        }, 1000);

    });
