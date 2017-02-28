/**
 * Device.js
 *
 * @description :: Devices
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        // Name of the device, given by installer
        name: {
            type:       'string',
            defaultsTo: ''
        },

        locationWithinVenue: {
            type:       'string',
            defaultsTo: ''
        },

        // WiFi MAC address, used to help uniquely identify the box
        wifiMacAddress: {
            type: 'string',
            defaultsTo: ''
        },

        // Eth MAC address, used to help uniquely identify the box
        ethMacAddress: {
            type:       'string',
            defaultsTo: ''
        },

        //TODO this should autogenerate a UUID when registered?
        uniqueId: {
            type:       'string',
            defaultsTo: ''
        },


        //TODO how will devices authenticate? Easiest is some JWT mechanism...
        apiToken: {
            type:  'string',
            defaultsTo: ''
        },

        blocked: {
            type: 'boolean',
            defaultsTo: false
        },
        
        // For methods like YouTube where you type in a randomly generated 6 digit code to tie 
        // a device to an account.
        regCode: {
            type: 'string',
            defaultsTo: ''
        },
        
        // Located at this venue
        venue: {
            model: 'venue'
        },

        deviceBackup: {
            type: 'json',
            defaultsTo: {}
        },

        lineupID: {
            type: 'string'
        },

        lineupName: {
            type: 'string'
        },


        toJSON: function () {
            var obj = this.toObject();
            if (!sails.config.policies.wideOpen) {
                delete obj.regCode;
                //TODO other things to hide? 
            }

            return obj;
        }

    }

    //BEFORE UPDATE?? 
};

