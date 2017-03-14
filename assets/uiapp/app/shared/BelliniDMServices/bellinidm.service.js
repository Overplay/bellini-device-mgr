/**
 * Created by mkahn on 3/14/17.
 */

app.factory( 'belliniDM', function ( $log, $http ) {
    var service = {};

    service.launchAppOnDevice = function(deviceUDID, appId){
        return $http.post( 'ogdevice/launch', { deviceUDID: deviceUDID, appId: appId } );
    }

    return service;

});