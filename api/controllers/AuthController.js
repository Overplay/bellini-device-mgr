/**
 * AuthController
 *
 * @module      :: Controller
 * @description    :: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var wl = require( 'waterlock-local-auth' )
var jwt = require( 'jwt-simple' )

var waterlock = require( "waterlock" )

module.exports = require( 'waterlock' ).waterlocked( {

    //returns the session user 
    status: function ( req, res ) {

        if ( req.session && req.session.user )
            return res.ok( req.session.user );
        else
            return res.forbidden( { error: "Not authorized" } );

    },

    // Show the login page from a template
    loginPage: function ( req, res ) {

        return res.view( 'users/login' + ThemeService.getTheme() );

    },

    /**
     * Does the same stuff as the built-in waterlock logout,
     * but lets us do a redirect that won't affect REST usage.
     *
     * @param req
     * @param res
     */
    logoutPage: function ( req, res ) {

        delete( req.session.user );
        req.session.authenticated = false;
        res.redirect( '/' );

    },

    changePwd: function ( req, res ) {

        var params = req.allParams();

        if ( params.newpass === undefined ) {
            // Must have a password or this is a waste of time
            res.badRequest( { error: "No new password specified" } );

        } else if ( params.email ) {

            // Email based reset
            AdminService.changePwd( { email: params.email, password: params.newpass } )
                .then( function () {
                    return res.json( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( { error: err } );
                } )

        } else if ( params.resetToken ) {

            // Attempt at token based reset. Let's make sure they are really cool
            if ( params.resetToken != req.session.resetToken.token ) {
                return res.forbidden( { error: "Reset token does not match" } );
            }

            AdminService.changePwd( { resetToken: params.resetToken, password: params.newpass } )
                .then( function () {
                    return res.ok( { "message": "Password changed" } );
                } )
                .catch( function ( err ) {
                    return res.error( { error: err } );
                } )


        } else {
            res.badRequest( { error: "Neither email nor reset token specified" } );
        }


    },

    addUser: function ( req, res ) {
        //sails.log.debug(req)
        var params = req.allParams();


        //handle no password if facebook this is ugly 
        if ( ( params.email === undefined) || (params.password === undefined) || (params.user === undefined) || (params.password === '' && !params.facebookId) )
            return res.badRequest( { error: "Missing email, password or user object" } );

        //HUGE security hole if someone tries to add themselves as an OG 
        if ( params.user.roleNames ) {
            params.user.roles = [];
            async.forEach( params.user.roleNames, function ( name ) {
                params.user.roles.push( RoleCacheService.roleByName( name ) )
            } )
            delete params.user.roleNames;

        }

        //TODO get the venue managers and owners here for the new user 

        AdminService.addUser( params.email, params.password, params.user, params.facebookId, params.validate ) //TRUE requires
                                                                                                       // validation
            .then( function ( data ) {
                //sails.log.debug(data)
                return res.ok( data )

            } )
            .catch( function ( err ) {
                if ( err.code && err.code === "E_VALIDATION" ) {
                    var messages = {}
                    _.forEach( err.invalidAttributes, function ( att ) {
                        att.forEach( function ( e ) {
                            messages[ e.rule ] = e.message;
                        } )
                    } )
                    return res.badRequest( { error: messages } )//{'message': 'Adding user failed'});
                }
                else
                    return res.badRequest( { error: err.message } )
            } )


    },


    signupPage: function ( req, res ) {

        if ( req.allParams().token ) { //TODO token expiration and what not

            try {
                var decoded = jwt.decode( req.allParams().token, sails.config.jwt.secret )

                var _reqTime = Date.now();
                // If token is expired
                if ( decoded.exp <= _reqTime )
                    return res.forbidden( { error: 'Your token is expired.' } );
                // If token is early
                if ( _reqTime <= decoded.nbf )
                    return res.forbidden( { error: 'This token is early.' } );
                // If the subject doesn't match
                if ( sails.config.mailing.inviteSub !== decoded.sub )
                    return res.forbidden( { error: 'This token cannot be used for this request.' } );

                var auth = {
                    email: decoded.email
                }

                var userObj = {
                    roleNames: [ decoded.role == "Manager" ? "proprietor.manager" : "proprietor.owner" ],
                }

                if ( decoded.role == "Manager" && decoded.venue ) {
                    userObj.managedVenues = [ decoded.venue ]
                }
                else if ( decoded.role == "Owner" && decoded.venue ) {
                    userObj.ownedVenues = [ decoded.venue ]
                }

                return res.view( 'users/signup' + ThemeService.getTheme(), {
                    data: JSON.stringify( {
                        auth: auth,
                        user: userObj,
                        type: 'invite'
                    } )
                } );
            }
            catch ( err ) {
                sails.log.debug( "CAUGHT: bad token request", err )
                //tell the user the token is bad? eh 
                return res.view( 'users/signup' + ThemeService.getTheme() );
            }


        }
        else
            return res.view( 'users/signup' + ThemeService.getTheme() );

    },

    resetPwd: function ( req, res ) {

        return res.view( 'users/resetPassword' + ThemeService.getTheme() );

    },

    validatedOk: function ( req, res ) {

        return res.view( 'users/validationOk' + ThemeService.getTheme() );
    },

    testLogin: function ( req, res ) {
        sails.log.debug( waterlock.actions.waterlocked() )
        waterlock.actions.waterlocked().login( req, res )

        //res.redirect('/ui')
    },

    upauth: function ( req, res ) {

        var params = req.params.all();

        if ( !params.password || !params.email ) {
            return res.badRequest( { error: 'missing parameter' } );
        }
        
        var pass = params.password;

        Auth.findOne({ email: params.email })
            .then( function(data){

                return res.ok();
            })
            .catch( function(err){

                if ( err.code === 'E_VALIDATION' ) {
                    return res.status( 400 ).json( err );
                } else {
                    return res.serverError( err );
                }

            });

        // scope.getUserAuthObject( params, req, function ( err, user ) {
        //     if ( err ) {
        //
        //     }
        //     if ( user ) {
        //         if ( !user.auth.blocked && bcrypt.compareSync( pass, user.auth.password ) ) {
        //             waterlock.cycle.loginSuccess( req, res, user );
        //         }
        //         else if ( user.auth.blocked ) {
        //             waterlock.cycle.loginFailure( req, res, user, { error: 'Account Not Validated or Blocked' } );
        //
        //         }
        //         else {
        //             waterlock.cycle.loginFailure( req, res, user, { error: 'Invalid ' + scope.type + ' or password' } );
        //         }
        //     } else {
        //         //TODO redirect to register
        //         waterlock.cycle.loginFailure( req, res, null, { error: 'user not found' } );
        //     }
        // } );
    }


} );