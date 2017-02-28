//Cole 8/11/16


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
        var params = req.allParams();
        var ad = params

        if (params.ad) {
            ad = params.ad
        }
        var id = ad.creator
        if (ad.creator.id) {
            id = ad.creator.id
        }
        if (id == req.session.user.id)
            return next()
    }
    return res.forbidden("Not owner of this ad")
}