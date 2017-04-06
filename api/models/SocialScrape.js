/**
 * SocialScrape.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    forDeviceUDID: {
      type: 'string',
      required: 'true'
    },

    forAppId: {
      type: 'string',
      required: 'true'
    },

    source: {
      type: 'string',
      required: 'true',
      defaultsTo: 'twitter'
    },

    queryString: {
      type: 'string'
    },

    queryJson: {
      type: 'json'
    },

    lastResult: {
      type: 'json'
    },

    lastScrapeTime: {
      type: 'datetime'
    },
    
    autoUpdate: {
      type: 'boolean',
      defaultsTo: true
    }

  }
};

