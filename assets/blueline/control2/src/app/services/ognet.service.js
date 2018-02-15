/*********************************

 File:       ognet.service.js
 Function:   Some additional methods not provided by ogAPI and only needed
             by the Control app.
 Copyright:  Ourglass TV
 Date:       2/7/18 10:04 PM
 Author:     mkahn

 **********************************/

const EP_FIND_BY_UDID = "/ogdevice/findByUDID?deviceUDID=";
const EP_CHANGE_DEVICE_NAME = "/ogdevice/changeName";
const EP_APP_STATUS_FOR_DEVICE = "/ogdevice/appstatus?deviceUDID=";

let _deviceUDID;

function stripData( response ) {
    return response.data;
}

export default class OgNetService {

    constructor( $http, ogAPI ) {
        this.$http = $http;
        _deviceUDID = ogAPI.getDeviceUDID(); // convenience
    }

    getDeviceInfo() {
        return this.$http.get( EP_FIND_BY_UDID + _deviceUDID )
            .then( stripData )
            .then( function ( device ) {
                device.isPairedToSTB = device.pairedTo && device.pairedTo.carrier;
                return device;
            } )
    }

    changeSystemName( newName ) {
        return this.$http.post( EP_CHANGE_DEVICE_NAME, { name: newName, deviceUDID: _deviceUDID } )
            .then( stripData );
    }

    getApps(){
        return this.$http.get( EP_APP_STATUS_FOR_DEVICE + _deviceUDID )
            .then( stripData );
    }

    setNativeBanner(msg){
        //TODO: Implement WKWebKit on
        //return this.$http.get('/$native$/setbanner/'+msg)
    }

    //FIXME was this ever used, did it ever work?
    register(regcode){
        throw new Error("Hey dipshit, this method was wrong since forever! Fix it!!");
        //return this.$http.post( '/api/system/regcode?regcode=' + regcode.toUpperCase() );
    }

    // Alternative to adding $inject field to class...read only!
    static get $inject() {
        return ['$http', 'ogAPI'];
    }

    // I like to have the name in one place
    static get serviceName() {
        return 'ogNet';
    }

}