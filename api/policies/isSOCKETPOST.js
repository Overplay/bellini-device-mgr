/**
 * isSOCKETPOST
 *
 * @module      :: Policy
 * @description :: Makes sure the action is a DELETE
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    if ( !req.isSocket ) {
        return res.badRequest( { error: "Sockets only, sonny" } );
    }

    if ( req.method !== 'POST' )
        return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

    next();
  
};
