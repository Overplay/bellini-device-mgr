/**
 * Created by cole on 8/11/16.
 */
/**
 *
 * @module      :: Policy
 * @description ::  policy to allow authenticated proprietor owner, user or admin to access auth info
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

//is me or admin or manager at one of my venues 
/*
 Definitely a strange policy, basically for any venue ownership views/lists
 */
module.exports = function (req, res, next) {

    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    //is admin
    if (RoleCacheService.hasAdminRole(req.session.user.roles))
        return next();

    // Need to dump roles and/or block if non-admin attempt to change level
    if (req.method == "PUT" || req.method == "POST") {
        if (req.body.roles || ("blocked" in req.body))
            return res.forbidden('You are not permitted to perform this action.');
    }


    //might not be nec depending on usage
    var isAuth = req.originalUrl.indexOf('/auth/') > -1;
    var isUser = req.originalUrl.indexOf('/user/') > -1;
    var isVenueReq = req.originalUrl.indexOf('/venue/') > -1;
    var lastPath;

    if (isVenueReq) {
        lastPath = req.allParams().id
    }
    else
        lastPath = req.originalUrl.substr(req.originalUrl.lastIndexOf('/') + 1);

    //is ME 

    if (isUser) {
        var thisUser = req.session.user.id;
        if (thisUser == lastPath) {
            return next();
        }
    } else if (isAuth) {
        var thisAuth = req.session.user.auth.id;
        if (thisAuth == lastPath) {
            return next();
        }
    }

    //is PO
    if (RoleCacheService.hasRole(req.session.user.roles, "proprietor", "owner")) {

        //is PO of venue manager 

        User.findOne(req.session.user.id)
            .populate('ownedVenues')
            .then(function (u) {
                if (u) {
                    //step through venues and populate their owners and managers and check
                    //check venue!
                    if (isVenueReq) {
                        if (_.find(u.ownedVenues, {'id': lastPath}))
                            return next()
                        else 
                            return res.forbidden()
                    }
                    else {
                        async.each(u.ownedVenues, function (venue, callback) {
                            return Venue.findOne(venue.id)
                                .populate('venueOwners')
                                .populate('venueManagers')
                                .then(function (v) {
                                    if (v) {
                                        var matches = _.union(_.filter(v.venueOwners, function (u) {
                                                if (isUser)
                                                    return lastPath == u.id
                                                return lastPath == u.auth
                                            }),
                                            _.filter(v.venueManagers, function (u) {
                                                if (isUser)
                                                    return lastPath == u.id
                                                return lastPath == u.auth
                                            }))
                                        if (matches.length > 0)
                                            callback(true)
                                        else
                                            callback()
                                    }
                                    else return res.badRequest()
                                })
                        }, function (match) {
                            if (match)
                                return next()
                            else
                                return res.forbidden()

                        })
                    }

                }
                else
                    return res.badRequest();
            })
            .catch(function (err) {
                sails.log.debug(err)
                return res.serverError(err)
            })
    }


    // User or Auth is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    else
        return res.forbidden('You are not permitted to perform this action.');


}