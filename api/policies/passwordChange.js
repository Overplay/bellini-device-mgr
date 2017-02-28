/**
 * password change
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated or with reset token
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {


    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if (req.session.authenticated && req.session.user) {
        if (RoleCacheService.hasAdminRole(req.session.user.roles)) {
            return next();
        }
        else if (req.session.user.auth.email === req.allParams().email)
            return next()
    }
    else if (req.session.resetToken) {
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden('You are not permitted to perform this action.');
};
