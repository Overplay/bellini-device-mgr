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

    atVenue: {
      model: 'venue'
    },

    name: {
      type: 'string',
      defaultsTo: "No Name"
    },

    installedApps: {
      type: 'array',
      defaultsTo: []
    },

    accessToken: {
      type: 'string',
      defaultsTo: ''
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
    
    lastContact: {
      type: 'date'
    }

  }
};

