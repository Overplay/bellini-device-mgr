/**
 * isDELETE
 *
 * @module      :: Policy
 * @description :: Makes sure the action is a DELETE
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    if ( req.method != 'DELETE' )
        return res.badRequest( { error: "Bad verb" } );

    next();
  
};
