/**
 * OGLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        logType: {
            type: "string",
            enum: ['impression', 'heartbeat', 'alert', 'channel', 'placement', 'other']
        },

        message: {
            type: "json"
        },

        deviceUniqueId: {
            type: 'string'
        },
        deviceId: {
            type: 'string'
        },
        loggedAt: {
            type: 'datetime'
        }
    }

    ,

    beforeUpdate: function (valuesToUpdate, cb) {
//        if (valuesToUpdate.loggedAt)
//            delete valuesToUpdate.loggedAt;
        cb();//TODO test this doesn't remove the record or whatever
    }

    //TODO before update prevention of changing loggedAT
    //TODO potential before create Date parsing of loggedAt
};

