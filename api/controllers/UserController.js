/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var Promise = require('bluebird');
var _ = require("lodash")
var jwt = require("jwt-simple")
var waterlock = require('waterlock')


module.exports = require('waterlock').actions.user({



    //only returns user ID so info is kept secure 
    findByEmail: function (req, res) {
        var params = req.allParams();

        if (!params.email) {
            res.badRequest({error: "No email provided"});
        } else {
            Auth.findOne({email: params.email})
                .populate("user")
                .then(function (auth) {
                    if (auth) {
                        //success
                        return res.json({userId: auth.user.id})
                    }
                    else {
                        //failure
                        return res.json({"error": "a user does not exist with this email"})
                    }
                })
        }
    },

    checkSession: function ( req, res ) {

        if ( req.session && req.session.user ) {
            var uid = req.session.user.id;
            User.findOne( { id: uid } )
                .populate( 'auth' )
                .then( function ( user ) {
                    if ( !user ) {
                        // You can end up here is the user has been whacked, or dbid changed. Either way,
                        // you need to respond notAuthorized and clear the session.
                        sails.log.error( "User has been deleted but is still in session!" );
                        req.session.destroy();
                        return res.notAuthorized( { error: 'user does not exist' } );
                    }

                    var juser = user.toJSON();
                    juser.email = user.auth && user.auth.email;
                    juser.isAdmin = !!(user.auth && (user.auth.ring == 1) )
                    // juser.isManager = user.managedVenues.length !=0;
                    // juser.isOwner =  user.ownedVenues.length != 0;
                    // delete user.auth;
                    delete juser.roles;
                    delete juser.auth.password;
                    // delete user.metadata;
                    // delete user.legal;
                    return res.ok( juser );
                } )
                .catch( res.serverError )
        } else {
            return res.notAuthorized( { error: 'not logged in' } );
        }


    },


    // replaces blueprint, easier to secure
    all: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        User.find( req.query )
            .populate( 'auth' )
            .then( res.ok )
            .catch( res.serverError );

    },


    getRoles: function (req, res){
        //policies will prevent calls other than GET and with valid JWT /auth to use this

        //ask how to get user id, in jwt im assuming

        User.find(id)
            .then(function(user){
                if (!user){
                    return res.notFound({error: "User not found"})
                }
                else {
                    var roles = RoleCacheService.getAllRolesAsStringArray(user.roles)
                    return res.ok({roles: roles})
                }
            })
    },

    // Sends a query to bellini core using the passed JWT
    coreuserfortoken: function(req, res){

        if ( req.method !== 'POST'){
            return res.badRequest({ error: 'bad verb'});
        }

        var params = req.allParams();
        if (!params.jwt){
            return res.badRequest( { error: 'no token' } );
        }

        BCService.User.checkJwt(params.jwt)
            .then(res.ok)
            .catch(res.proxyError);

    },

    isusermanager: function(req, res){

        if ( req.method !== 'POST' ) {
            return res.badRequest( { error: 'bad verb' } );
        }

        var params = req.allParams();

        if ( !params.jwt || !params.deviceUDID ) {
            return res.badRequest( { error: 'no token or no udid' } );
        }

        var prereqs = [
            BCService.User.checkJwt( params.jwt ),
            OGDevice.findOne({ deviceUDID: params.deviceUDID })
        ];

        Promise.all(prereqs)
            .then( function(results){

                var user = results[0];
                var device = results[1];

                if (!user){
                    return res.badRequest({ error: 'invalid jwt'});
                }

                if ( !device ) {
                    return res.badRequest( { error: 'no such device' } );
                }

                if (user.auth.ring === 1){
                    return res.ok({ owner: true, manager: true, anymanager: true });
                }

                var mgdIdx = _.findIndex(user.managedVenues, { 'uuid': device.atVenueUUID });
                var ownedIdx = _.findIndex( user.ownedVenues, { 'uuid': device.atVenueUUID } );

                return res.ok({ manager: mgdIdx>=0, owner: ownedIdx>=0, anymanager: ((mgdIdx >= 0) ||  (ownedIdx >= 0))});

            })
            .catch(res.serverError);

    }


});



