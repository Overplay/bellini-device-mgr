/**
 * Ad.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string'
        },
        creator: { //TODO just user ID now ***
            type: 'string'
        },
        advert: {
            type: 'json',
            required: true
        },

        /*
         advert: {
         type: '2g3s
         text: ['','',''],
         media: {
                widget: null,
                crawler: null
            }
         },
         */

        paused: {
            type: 'boolean',
            defaultsTo: false
        },
        reviewed: {
            type: 'boolean',
            defaultsTo: false
        },
        accepted: {
            type: 'boolean',
            defaultsTo: false
        },
        deleted: {
            type: 'boolean',
            defaultsTo: false
        },
        metaData: {
            type: 'json',
            defaultsTo: {}
        }


    },

    afterCreate: function (values, cb) {
        MailingService.adReviewNotification(); 
        cb();
    },

    //handle this only when a user is updating and not when admin is doing it - maybe move to controller on the updating end? idk
    /*afterUpdate: function(values, cb){
     MailingService.adReviewNotification("EMAIL"); 
     cb();
     }*/
};

