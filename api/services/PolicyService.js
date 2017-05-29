/*********************************

 File:       PolicyService.js
 Function:   Common Policy Helper Functions
 Copyright:  Overplay TV
 Date:       5/3/17 9:42 AM
 Author:     mkahn

 Note: This service is intended for very common policy tasks, not policy-specific code. So for example,
 you would put in here a check for admin/bypass, but not a complicated work-state policy.

 **********************************/


module.exports = {

    isAdmin: function(req){

        return sails.config.policies.wideOpen ||
            ( req.session.authenticated && !req.session.user.auth.blocked && req.session.user.auth.ring == 1 );

    },

    // TODO: this is pretty weak. It will also allow external Node clients to mess with us.
    isPeerToPeer: function(req){

        return req.headers[ 'user-agent' ] && req.headers[ 'user-agent' ].startsWith( 'node-superagent' );

    },

    isLoggedIn: function(req){

        return sails.config.policies.wideOpen ||
            (req.session.authenticated && !req.session.user.auth.blocked);

    },

    // For testing purposes. This will normally be turned off
    isMagicJwt: function(req){
        return sails.config.security.magicJwt && (req.headers[ 'authorization' ] == sails.config.security.magicJwt);
    },

    getUserForReq: function(req){

        var hasValidUser = !!req.session && !!req.session.user;
        if (hasValidUser)
            return req.session.user;

        return false;
    },

    hasMagicMobileHeader: function(req){
        return req.headers[ 'X-OG-Mobile' ] && req.headers[ 'X-OG-Mobile' ] === "OGHomey";
    }

};