/**
 * hasValidatedDeviceUDID
 *
 * @module      :: Policy
 * @description :: Makes sure there is a deviceUDID param and that device is in DB
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

    if ( !req.allParams().deviceUDID )
        return res.badRequest( { error: "missing device udid" } );

    OGDevice.findOneByDeviceUDID(req.allParams().deviceUDID)
        .then( function(d){
            if (d) return next();
            return res.badRequest({ error: 'invalid device' });
        })
        .catch( function(err){
            return res.serverError(err);
        })

};
