/**
 * OGAndroidRelease.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    majorRev: {
      type: 'integer',
      required: true
    },

    minorRev: {
      type: 'integer',
      required: true
    },

    versionCode: {
        type: 'integer',
        required: true
    },

    filename: {
      type: 'string',
      required: true
    },

    releaseLevel: {
        type: 'string',
        enum: ['archive', 'alpha', 'beta', 'release'],
        defaultsTo: 'archive'
    }

  }
};

