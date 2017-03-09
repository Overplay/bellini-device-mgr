/**
 * AppData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        forAppId: {
            type: "string",
            defaultsTo: ""
        },

        forVenueId: {
            type:       "string",
            defaultsTo: ""
        },

        forDeviceUDID: {
            type:       "string",
            defaultsTo: ""
        },

        data: {
            type:       "json",
            defaultsTo: {}
        },

        lockedUntil: {
            type: "integer",
            defaultsTo: 0
        },

        lockedByDeviceId: {
            type:       "string",
            defaultsTo: ""
        }

    }
};

