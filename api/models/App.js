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

    toJSON: function () {
      var obj = this.toObject();
      obj.iconPath = '/blueline/opp/' + obj.appId + '/assets/icons/' + obj.icon;
      return obj;
    }

  }
};

