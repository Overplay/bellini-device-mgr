/**
 * isMeOrAdmin
 *
 * Designed for use on GET user/:id
 * Will only work if you are admin, or if the session userId matches the endpoint id you are going for
 *
 * @module      :: Policy
 * @description :: Simple policy to allow authenticated admin user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function ( req, res, next ) {

    // Must be proceeded by sessionAuth policy or it will crash the server!!

    // This policy needs to work for  /auth/ and  /user/ but the
    // test is different depending on which.

    
    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }


    if ( RoleCacheService.hasAdminRole( req.session.user.roles ) )
        return next();

    // Need to dump roles and/or block if non-admin attempt to change level
    if ( req.method == "PUT" || req.method == "POST" ){
        if (req.body.roles  || ("blocked" in req.body) )
            return res.forbidden( 'You are not permitted to perform this action.' );
    }

    var isAuth = req.originalUrl.indexOf('/auth/') > -1;
    var isUser = req.originalUrl.indexOf( '/user/' ) > -1;
    var lastPath = req.originalUrl.substr( req.originalUrl.lastIndexOf( '/' ) + 1 );


    if (isUser){
        var thisUser = req.session.user.id;
        if ( thisUser == lastPath ) {
            return next();
        }
    } else if (isAuth){
        var thisAuth = req.session.user.auth.id;
        if ( thisAuth == lastPath  ) {
            return next();
        }
    }
    
    // User or Auth is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden( 'You are not permitted to perform this action.' );
    
};
