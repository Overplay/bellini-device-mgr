/**
 * authProtection
 *
 * @module      :: Policy
 * @description :: Makes sure only the owner of an Auth can Edit it *and* that only admin can
 *                  change the ring level
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {

    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if ( req.session.authenticated && !req.session.user.auth.blocked ) {

        if (req.session.user.auth.ring==1){
            return next();
        }

        // Must be getting own auth and not trying to set the body!
        var allp = req.allParams();
        var legitUrl = ( allp.id == req.session.user.auth.id );
        var legitBody = !req.body.ring;

        if ( legitUrl && legitBody ){
            return next();
        }

    }

    return res.forbidden( { error: 'not authorized'} );
};
