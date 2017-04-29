/**
 * authDecorator
 *
 * @module      :: Policy
 * @description :: Sets the local variables for the view for the current auth state. Doesn't block anyone.
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
 
module.exports = function ( req, res, next ) {

    // Add decoration all views can count on
    req.options.locals = req.options.locals || {};
    // This !! bit of magic converts truthy/falsy to the hard true/false that EJS needs
    req.options.locals.authenticated = !!req.session.authenticated;
    req.options.locals.admin = !!( req.session.user && req.session.user.auth && (req.session.user.auth==1));

    req.options.locals.roles = "Yeah, we don't do roles anymore";
    
    return next();

};