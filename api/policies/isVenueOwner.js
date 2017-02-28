/**
 * Created by cole on 8/11/16.
 */
/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated proprietor owner to access their venue info
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {


    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    var venue = req.allParams();
    if (RoleCacheService.hasAdminRole(req.session.user.roles)) {
        return next(); //admin can manage any venue 
    }
    else {
        User.findOne(req.session.user.id)
            .populate('ownedVenues')
            .then(function (user) {
                if (user) {
                    if (_.find(user.ownedVenues, {'id': venue.id}))
                        return next()
                    else
                        return res.forbidden("not venue owner")
                }
                else return res.serverError("No user found. This is extremely bad")
            })
            .catch(function (err) {
                return res.serverError(err);
            })

    }

};
