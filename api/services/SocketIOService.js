/**
 * Created by mkahn on 9/13/17.
 */

module.exports = {

    // Sends a DEVICE_DM event to the deviceUDID room
    sendDeviceDM: function ( deviceUDID, message, req ) {

        sails.sockets.broadcast( "device_" + deviceUDID,
            'DEVICE-DM',
            message,
            req );

    }

}