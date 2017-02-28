/**
 * Created by ryanhartzell on 9/8/16.
 */

module.exports = function (req, res, next) {

    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    if (!req.headers.authorization)
        return res.badRequest("No authorization header");

    if (req.headers.authorization !== sails.config.tempAuth.type + " " + sails.config.tempAuth.secret)
        return res.badRequest("Invalid authorization");
    else
        return next();
};
