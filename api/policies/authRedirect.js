/**
 * authDecorator
 *
 * @module      :: Policy
 * @description :: Sets the local variables for the view for the current auth state. Doesn't block anyone.
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
 
module.exports = function ( req, res, next ) {
    

    if ( req.session.authenticated && !req.session.user.auth.blocked ) {
        return res.redirect( "/ui" );
    }

    return next();

};