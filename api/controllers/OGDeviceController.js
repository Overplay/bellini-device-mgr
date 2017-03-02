/**
 * OGDeviceController
 *
 * @description :: Server-side logic for managing Ogdevices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var Promise = require( 'bluebird' );

module.exports = {

    /**
     * Register a new device for the first time
     * @param req
     * @param res
     * @returns {*}
     */
    registerDevice: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        // TODO: Shouldn't blindly toss all params into the model!! [mak]
        OGDevice.create( params )
            .then( function ( device ) {
                return res.ok( device );
            } )
            .catch( function ( err ) {
                if ( err.code == 'E_VALIDATION' )
                    return res.badRequest( { error: "Already registered" } );

                return res.serverError( err );
            } );
    },

    associateWithVenue: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID || !params.venue )
            return res.badRequest( { error: 'missing parameters' } );

        var preconditions = {
            device: OGDevice.findOneByDeviceUDID( params.deviceUDID ),
            venue:  Venue.findOne( params.venue )
        };

        Promise.props( preconditions )
            .then( function(resp){

            if ( !resp.venue)
                return res.badRequest( { error: "No such venue" } );

            if ( !resp.device )
                return res.badRequest( { error: "No such device" } );

            var device = resp.device;
            device.atVenue = resp.venue.id;
            device.save()
                .then( function(){
                    return res.ok(device)
                })
                .catch( function ( err ) {
                    return res.serverError(err)
                });

        })
        .catch( res.serverError );

    },

    joinroom: function( req, res ){

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing params" } );

        var room = params.deviceUDID;

        sails.sockets.join( req, room );

        // Broadcast a notification to all the sockets who have joined
        // the "funSockets" room, excluding our newly added socket:
        sails.sockets.broadcast( room,
            'DEV-JOIN',
            { message: 'Welcome to the OGDevice rooms for '+params.deviceUDID },
            req );

        return res.ok({ message: 'joined'});

    },

    dm: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID || !params.message )
            return res.badRequest( { error: "Missing params" } );

        sails.sockets.broadcast( params.deviceUDID, 'DEV-DM', { message: params.message }, req );

        return res.ok(params);

    }


};

