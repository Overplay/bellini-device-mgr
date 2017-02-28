/**
 * adminAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
 
 // TODO: This can go away with a check in res.forbidden for JSON request
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authenticated && !req.session.user.auth.blocked ) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  res.status(403);
  return res.json({ description: "Not authorized"});

};
