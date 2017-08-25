/**
 * Created by mkahn on 3/14/17.
 */

app.factory( 'belliniDM', function ( $log, $http, $q ) {
    var service = {};
    
    function stripData(data){
        return data.data;
    }

    service.launchAppOnDevice = function(deviceUDID, appId){
        return $http.post( 'ogdevice/launch', { deviceUDID: deviceUDID, appId: appId } );
    };

    service.killAppOnDevice = function ( deviceUDID, appId ) {
        return $http.post( 'ogdevice/kill', { deviceUDID: deviceUDID, appId: appId } );
    };

    service.moveAppOnDevice = function ( deviceUDID, appId ) {
        return $http.post( 'ogdevice/move', { deviceUDID: deviceUDID, appId: appId } );
    };
    
    service.changeDeviceName = function ( deviceUDID, newName ) {
        return $http.post( 'ogdevice/changeName', { deviceUDID: deviceUDID, name: newName } );
    };

    service.sioPost = function(url, jsonData){
        return $q( function ( resolve, reject ) {

            io.socket.post( url, jsonData, function ( resData, jwres ) {
                if ( jwres.statusCode === 200 ) {
                    resolve( resData );
                }
                else {
                    reject( { jwres: jwres, data: resData } );
                }
            } );
        } )

    };

    /**
     * messageToDevice
     *
     * @param deviceUDID
     * @param messageJson
     * @returns {HttpPromise}
     */
    service.messageToDevice = function ( deviceUDID, messageJson ) {

        return service.sioPost( '/ogdevice/message', {
            deviceUDID:  deviceUDID,
            destination: 'device',
            message:     messageJson
        });

    };

    return service;

});