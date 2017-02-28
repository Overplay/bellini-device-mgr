/**
 * Venue.js
 *
 * @description :: Venue where devices are managed. Eventually will reference Organization.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: 'string',
            defaultsTo: ''
        },

        yelpId: {
            type: 'string',
            defaultsTo: ''
        },

        address: {
            type: 'json'
        },

        // Array of Mongo Ids of Media associated with this venue
        photos: {
            type: 'array',
            defaultsTo: []
        },
        
        // This is a denormalized way of saving the logo image. We just stash the Mongo id here instead of
        // using relationships. We need to figure out what the right way is for this app.
        logo: {
            type: 'string',
            defaultsTo: ''
        },


        // For determining where a user is and whether venue is shown on the Mobile app
        // finder app 
        geolocation: {
            type: 'json'
        },

        showInMobileAppMap: {
            type: 'boolean',
            defaultsTo: true
        },

        publicWifiSSID: {
            type: 'string',
            defaultsTo: ''
        },

        devices: {
            collection: 'Device',
            via: 'venue'
        },

        venueOwners: {
            collection: 'User',
            via: 'ownedVenues'
        },

        venueManagers: {
            collection: 'User',
            via: 'managedVenues'
        },

        organization: {
            model: 'Organization'
        },

        textHistory: {
            type: 'array',
            defaultsTo: []
        },

        sponsorships: {
            type: 'array',
            defaultsTo: []
        }
    },

    //not sure if this is needed for anything? -CEG 
    beforeUpdate: function( valuesToUpdate, cb ){
        //sails.log.debug("In before update for venue");//, valuesToUpdate);
        cb();
    }
};