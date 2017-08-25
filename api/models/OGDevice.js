/**
 * OGDevice.js
 *
 * @description :: Registration info for every devices
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

// Alex Westlake training, yay!

module.exports = {

    attributes: {

        deviceUDID: {
            type:     'string',
            required: true,
            unique:   true
        },

        atVenueUUID: {
            type: 'string'
        },

        name: {
            type:       'string',
            defaultsTo: "No Name"
        },

        installedApps: {
            type:       'array',
            defaultsTo: []
        },

        runningApps: {
            type:       'array',
            defaultsTo: []
        },

        accessToken: {
            type:       'string',
            defaultsTo: ''
        },

        hardware: {
            type:       'json',
            defaultsTo: {}
        },

        software: {
            type:       'json',
            defaultsTo: {}
        },

        data: {
            type:       'json',
            defaultsTo: {}
        },

        lastContact: {
            type: 'date'
        },

        guideInfo: {
            type:       'json',
            defaultsTo: {
                source:   'ogpgs',
                lineupId: "5266D",
                carrier:  "DirecTV"
            }
        },

        pairedTo: {
            type:       'json',
            defaultsTo: {}
        },

        currentProgram: {
            type:       'json',
            defaultsTo: {}
        },

        timeZoneOffset: {
            type:       'string',
            defaultsTo: '-0700'
        },

        favoriteChannels: {
            type:       'array',
            defaultsTo: []
        },

        hideChannels: {
            type:       'array',
            defaultsTo: []
        },

        tempRegCode: {
            type: 'string',
            defaultsTo: ''
        }

    },

    afterUpdate: function(updatedRecord, cb){

        // If the reg code is set, put a timeout to clear it in 5 minutes
        if (updatedRecord.tempRegCode){
            setTimeout( function(){
                OGDevice.update({ deviceUDID: updatedRecord.deviceUDID }, { tempRegCode: ''})
                    .then(function(dev){
                        sails.log.silly("Cleared temp reg code");
                    })
            }, 5 * 60 * 1000);
        }

        cb();
    },

    beforeCreate: function(values, cb){

        values.lastContact= new Date();
        cb();
    }
};

