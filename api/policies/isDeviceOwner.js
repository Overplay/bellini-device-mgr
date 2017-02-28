/**
 * Created by cgrigsby on 5/16/16.
 */


/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated device owner modify device
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */



module.exports = function (req, res, next) {


    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    //allow admin access 
    if (RoleCacheService.hasAdminRole(req.session.user.roles)) {
        return next();
    }


    else {
        var device = req.allParams();
        sails.log.debug(device)
        Device.findOne(device.id)
            .then(function (d) {
                sails.log.debug(d)
                if (d) {
                    device = d;
                    User.findOne(req.session.user.id)
                        .populate("ownedVenues")
                        .then(function (user) {
                            if (_.filter(user.ownedVenues, function (v) {
                                    return device.venue === v.id;
                                })) {
                                sails.log.debug(req.allParams(), "has access")
                                return next();
                            }
                            else {
                                return res.forbidden('You are not permitted to perform this action.');

                            }
                        })
                    //check if current users ownedVenues matches up with the devices venue id

                }
                else {
                    sails.log.debug("Device not found when it should exist")
                    return res.badRequest('Device Not found, should exist.');
                }
            })
            .catch(function (err) {
                return res.serverError(err);
            })

    }


};
