/**
 * hasDeviceUDID
 *
 * @module      :: Policy
 * @description :: Makes sure there is a deviceUDID param
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    if ( !req.allParams().deviceUDID )
        return res.badRequest( { error: "missing device udid" } );

    next();
  
};
