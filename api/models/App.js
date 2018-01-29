/**
 * App.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  
    appId: {
      type: 'string',
      required: 'true',
      unique: 'true'
    },
    
    displayName: {
      type: 'string',
      defaultsTo: 'UnnamedApp'
    },
    
    icon: {
      type: 'string',
      defaultsTo: 'appicon.png'
    },
    
    defaultModel: {
      type: 'json',
      defaultsTo: {}
    },
    
    appWidth: {
      type: 'integer'
    },

    appHeight: {
      type: 'integer'
    },

    appType: {
      type: 'string'
    },

    patronControllable: {
      type: 'boolean',
      defaultsTo: false
    },

    releaseLevel: {
      type: 'string',
      enum: ['dev', 'alpha', 'beta', 'release'],
      defaultsTo: 'dev'
    },
    
    // Virtual apps do not appear on the app picker in the System Control app. They are for things like DirecTV
    // tweet scraping.
    isVirtual: {
      type: 'boolean',
      defaultsTo: false
    },

    description: {
      type: 'string',
      defaultsTo: ''
    },

    hidden: {
      type: 'boolean',
      defaultsTo: false
    },

    toJSON: function () {
      var obj = this.toObject();
      obj.iconPath = '/blueline/opp/' + obj.appId + '/assets/icons/' + obj.icon;
      return obj;
    }

  }
};

