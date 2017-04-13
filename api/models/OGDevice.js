/**
 * OGDevice.js
 *
 * @description :: Registration info for every devices
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {

    deviceUDID: {
      type: 'string',
      required: true,
      unique: true
      },

    atVenueUUID: {
      type: 'string'
    },

    name: {
      type: 'string',
      defaultsTo: "No Name"
    },

    installedApps: {
      type: 'array',
      defaultsTo: []
    },

    runningApps: {
      type:       'array',
      defaultsTo: []
    },

    accessToken: {
      type: 'string',
      defaultsTo: ''
    },
    
    currentProgram: {
      type: 'json',
      defaultsTo: {}
    },

    logs: {
      collection: 'ogLog',
      via: 'forDevice'
    },

    hardware: {
      type: 'json',
      defaultsTo: {}
    },
    
    software: {
      type: 'json',
      defaultsTo: {}
    },

    data: {
      type: 'json',
      defaultsTo: {}
    },
    
    lastContact: {
      type: 'date'
    }

  }
};

