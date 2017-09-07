/**
 * adminAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {

    if ( sails.config.policies.wideOpen )
        return next();

    if ( req.session.device ){
        return next();
    }

    if ( req.headers.authorization ) {
        var authHeader = req.headers.authorization;
        if ( authHeader.indexOf( 'Bearer' ) < 0 ) {
            return res.forbidden( { error: 'no token' } );
        }

        BCService.User.checkJwt( authHeader )
            .then( function ( user ) {
                sails.log.silly(user)
                req.bcuser = user;
                return next();
            } )
            .catch( res.forbidden );

    } else {
        return res.forbidden( { error: 'no token' } );
    }



};
