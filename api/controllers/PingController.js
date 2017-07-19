/**
 * Created by mkahn on 7/19/17.
 */

module.exports = {


    ping: function ( req, res ) {

        res.ok({ message: 'ok' });
    },

    //TODO this needs a policy that looks for the device auth header
    pingdevice: function (req, res) {


    }

}