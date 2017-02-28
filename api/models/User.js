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

        legal: {
            type:       'json',
            defaultsTo: {}
        },

        address: {
            type:       'json',
            defaultsTo: {}
        },

        demographics: {
            type:       'json',
            defaultsTo: {}
        },

        registeredAt: {
            type: 'datetime'
        },

        // User is blocked until they validate thru email or text
        // For now, not implemented
        

        // Array of ids of roles. Not a collection because we don't want all the relation stuff slowing us 
        // down.
        roles: {
            type: 'array',
            defaultsTo: []
        },
        
        ownedVenues: {
            collection: 'Venue',
            via: 'venueOwners'
        },

        managedVenues: {
            collection: 'Venue',
            via: 'venueManagers'
        },

        organization: { //only for proprietors 
            model: 'Organization'
        },
        

        toJSON: function() {

            var obj = this.toObject();
            var roleArray = [];

            if (!obj.roles){

                sails.log.debug('Dinglehead roles is missing on user')
                obj.roles = "MIA";

            } else {

                obj.roles.forEach( function ( roleId ) {
                    if ( roleId )
                        roleArray.push( RoleCacheService.roleStringForId( roleId ) );
                } );
                obj.roleTypes = roleArray;

            }

            return obj;
        }


    } ),


    rolesAsStrings: function(userId){

        return Promise( function(resolve, reject){

            User.findOne(userId)
                .then( function(user){
                    if (!user)
                        return reject( new Error('No such user id'));
                    
                    var rval = [];
                    user.roles.forEach( function(roleId){
                        Role.findOneById(roleId)
                            .then( function(role){
                                // So in theory we could have a role get deleted out and not fixed in the db
                                // we will ignore that here and just not return ot throw such
                                if (role)
                                    rval.push(role);
                            });
                    })

                })
            

        })
    },


    beforeCreate: require( 'waterlock' ).models.user.beforeCreate,
    beforeUpdate: require( 'waterlock' ).models.user.beforeUpdate //TODO remove venues?
};
