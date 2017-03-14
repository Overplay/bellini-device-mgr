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
    }
    
    

  }
};

