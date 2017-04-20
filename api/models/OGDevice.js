/**
 * OGDevice.js
 *
 * @description :: Registration info for every devices
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


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

        logs: {
            collection: 'ogLog',
            via:        'forDevice'
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
        }

    }
};

