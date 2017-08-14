/**
 * coreSessionAuth
 *
 * @module      :: Policy
 * @description :: Makes sure user has a session on Bellini-Core. This will go away once sessions are shared.
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {

    if ( sails.config.policies.wideOpen )
        return next();

    if ( PolicyService.hasMagicMobileHeader( req ) )
        return next();


    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if ( req.session.authenticated && !req.session.user.auth.blocked ) {
        return next();
    }


    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden( 'You are not permitted to perform this action.' );

};
