/**
 * forceAnonToLogin
 *
 * @module      :: Policy
 * @description :: Shoves an unauthorized user right to login page
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authenticated && !req.session.user.auth.blocked ) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.redirect('auth/loginPage');
};
