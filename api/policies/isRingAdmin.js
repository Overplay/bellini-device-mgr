/**
 * isRingAdmin
 *
 * @module      :: Policy
 * @description :: New Admin policy
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {


    if ( sails.config.policies.wideOpen ) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }
  
    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if ( req.session.authenticated && !req.session.user.auth.blocked && req.session.user.auth.ring==1 ) {
        return next();
    }

    return res.forbidden( 'You are not permitted to perform this action.' );
};
