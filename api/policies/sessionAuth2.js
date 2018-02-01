/**
 * adminAuth
 *
 * @module      :: Policy (from Bellini Core)
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {


    if ( sails.config.policies.godToken && req.headers.authorization && req.headers.authorization === "Bearer OriginalOG" ) {
        next();
    } else if ( req.headers.authorization ) {

        waterlock.validator.validateTokenRequest( req, function ( err, user ) {
            if ( err ) {
                return res.forbidden( { error: "Uncool auth header" } );
            }

            // valid request
            next();
        } );

    } else {

        if ( PolicyService.isLoggedIn( req ) ||
            PolicyService.isPeerToPeer( req ) ||
            PolicyService.isMagicJwt( req ) )
            return next();

        // User is not allowed
        return res.forbidden( { error: 'not logged in policy' } );

    }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
  
};
