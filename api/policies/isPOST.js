/**
 * isPOST
 *
 * @module      :: Policy
 * @description :: Makes sure the action is a POST
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    if ( req.method != 'POST' )
        return res.badRequest( { error: "Bad verb" } );

    next();
  
};
