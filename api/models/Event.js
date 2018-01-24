/**
 * Event.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require( 'uuid/v4' );

module.exports = {

    schema: true, // we don't want random cruft in the DB

    attributes: {

        name: {
            type: "string",
        },

        description: {
            type: 'string'
        },

        type: {
            type: 'string'
        },

        date: {
            type: 'date'
        },

        uuid: {
            type: 'string'
        },

        data: {
            type: 'json'
        }

    },

    beforeCreate: function ( values, cb ) {

        if ( !values.uuid ) {
            values.uuid = uuid();
        }

        cb();

    }

};

