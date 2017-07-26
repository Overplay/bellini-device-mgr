/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

var Promise = require( 'bluebird' );

module.exports = {

    attributes: require( 'waterlock' ).models.user.attributes( {

        // Included in the waterlock base user model are:
        /*
         {
         "auth": {
         "password": "$2a$10$lXs7hexMrvaz2tBVVZcuEugM8fsNOX/Ww3akh3DBn0OloEpmmjJ1."
         "email": "mitch@overplay.io"
         "createdAt": "2016-04-05T15:57:22.427Z"
         "updatedAt": "2016-04-05T15:57:22.454Z"
         "id": 1
         }-
         "createdAt": "2016-04-05T15:57:22.449Z"
         "updatedAt": "2016-04-05T15:57:22.449Z"
         "id": 1
         }
         */
        
        firstName: {
            type:       'string',
            defaultsTo: ''
        },

        lastName: {
            type:       'string',
            defaultsTo: ''
        },

        // Just because we might need it
        metadata: {
            type:       'json',
            defaultsTo: {}
        },

        /* We need this for SMS notifiers */
        mobilePhone: {
            type:       'string',
            defaultsTo: ''
        },

        /* All of these could be shoved under the data field, but this standardizes them */


        registeredAt: {
            type: 'datetime'
        },

        // Used to flag whether developer options should appear in the mobile app
        isDev: {
            type: 'boolean',
            defaultsTo: false
        },


        toJSON: function() {

            var obj = this.toObject();

            // This was all deleted when we went to ring security

            return obj;
        }


    } ),



    beforeCreate: require( 'waterlock' ).models.user.beforeCreate,
    beforeUpdate: require( 'waterlock' ).models.user.beforeUpdate
};
