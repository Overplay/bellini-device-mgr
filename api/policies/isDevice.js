/**
 * adminAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  
  if ( sails.config.policies.wideOpen )
    return next();

  // if (req.session.authenticated && !req.session.user.auth.blocked ) {
  //   return next();
  // }

  if ( req.headers.authorization && req.headers.authorization==='x-ogdevice-1234')
    return next();

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.forbidden('You are not permitted to perform this action.');
  
};
