/**
 * Organization.js
 *
 * @description :: Organization is a model that overarchs venues and admin/proprietors to control
 *                  the layout of venues across a group
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: 'string',
            defaultsTo: ''
        },

        contactInfo: {
            type: 'json' //additional methods of contact and times?
        },

        address: {
            type: 'json',
            defaultsTo: {}

        },

        phone: {
            type: 'integer',
            defaultsTo: ''
        },

        email: {
            type: 'string',
            defaultsTo: ''
        },

        websiteUrl: {
            type: 'string',
            defaultsTo: ''
        },

        admins: { //organizational admins
            type: 'array',
            defaultsTo: []
        },

        organizationProprietors: { //one to many currently
            collection: 'User',
            via: 'organization'
        },

        //organization does not currently keep track of its user's (they are not organization specific?)

        venues: { //one to many currently
            collection: 'Venue',
            via: 'organization'
        }


    }
};

