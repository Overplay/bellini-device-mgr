/**
 * Created by mkahn on 3/14/17.
 */

app.factory( 'belliniDM', function ( $log, $http ) {
    var service = {};

    service.launchAppOnDevice = function(deviceUDID, appId){
        return $http.post( 'ogdevice/launch', { deviceUDID: deviceUDID, appId: appId } );
    };

    service.killAppOnDevice = function ( deviceUDID, appId ) {
        return $http.post( 'ogdevice/kill', { deviceUDID: deviceUDID, appId: appId } );
    };

    service.moveAppOnDevice = function ( deviceUDID, appId ) {
        return $http.post( 'ogdevice/move', { deviceUDID: deviceUDID, appId: appId } );
    };

    return service;

});