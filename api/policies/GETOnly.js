/**
 * GET only 
 *
 * @module      :: Policy
 * @description :: Allows next if the request method is get 
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function ( req, res, next ) {

    if ( sails.config.policies.wideOpen ) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    if ( req.method == 'GET' ) {
        return next()
    }
    else {
        return res.badRequest({error: "Improper request method!"})
    }

};