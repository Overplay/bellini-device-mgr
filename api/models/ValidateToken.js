/**
 * Created by mkahn on 4/26/16.
 */

/**
 * ValidateToken
 *
 * @module      :: Model
 * @description :: Describes a user's account validation token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

    attributes: require( 'waterlock' ).models.validateToken.attributes( {

        /* e.g.
         nickname: 'string'
         */

    } ),

    beforeCreate: require( 'waterlock' ).models.validateToken.beforeCreate,
    afterCreate:  require( 'waterlock' ).models.validateToken.afterCreate
};
