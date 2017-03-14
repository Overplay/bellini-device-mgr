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
    register: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        OGDevice.findOrCreate( { deviceUDID: params.deviceUDID }, { deviceUDID: params.deviceUDID } )
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

        if ( !params.deviceUDID || !params.venueUUID )
            return res.badRequest( { error: 'missing parameters' } );

        var preconditions = {
            device: OGDevice.findOne( { deviceUDID: params.deviceUDID }),
            venue:  Venue.findOne( { uuid: params.venueUUID } )
        };

        Promise.props( preconditions )
            .then( function ( resp ) {

                if ( !resp.venue )
                    return res.badRequest( { error: "No such venue" } );

                if ( !resp.device )
                    return res.badRequest( { error: "No such device" } );

                var device = resp.device;
                device.atVenueUUID = resp.venue.uuid;
                device.save()
                    .then( function () {
                        return res.ok( device )
                    } )
                    .catch( function ( err ) {
                        return res.serverError( err )
                    } );

            } )
            .catch( res.serverError );

    },

    joinroom: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing params" } );

        var room = "device_" + params.deviceUDID;

        sails.sockets.join( req, room );

        // Broadcast a notification to all the sockets who have joined
        // the "funSockets" room, excluding our newly added socket:
        sails.sockets.broadcast( room,
            'DEVICE-JOIN',
            { message: 'Welcome to the OGDevice room for ' + params.deviceUDID },
            req );

        return res.ok( { message: 'joined' } );

    },

    dm: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to message, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.message )
            return res.badRequest( { error: "Missing message" } );

        sails.sockets.broadcast( "device_" + params.deviceUDID, 'DEVICE-DM', params.message, req );

        return res.ok( params );

    },

    launch: function ( req, res ) {


        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to message, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.appId )
            return res.badRequest( { error: "Missing app ID" } );

        App.findOne( { appId: params.appId } )
            .then( function ( model ) {
                if ( !model )
                    return res.badRequest( { error: "No such app" } );

                sails.sockets.broadcast( "device_" + params.deviceUDID,
                    'DEVICE-DM',
                    {
                        action:  'launch',
                        appId:   params.appId,
                        fullUrl: '/blueline/opp/' + params.appId + '/app/tv',
                        width:   model.appWidth || 15,
                        height:  model.appHeight || 40,
                        appType: model.appType || 'widget'
                    },
                    req );

                return res.ok( { status: "ok" } );
            } )
            .catch( res.serverError )

    },

    kill: function ( req, res ) {


        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to message, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.appId )
            return res.badRequest( { error: "Missing app ID" } );

        sails.sockets.broadcast( "device_" + params.deviceUDID,
            'DEVICE-DM',
            {
                action:  'kill',
                appId:   params.appId
            },
            req );

        return res.ok( { status: "ok" } );
    },

    move: function ( req, res ) {


        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to message, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.appId )
            return res.badRequest( { error: "Missing app ID" } );

        sails.sockets.broadcast( "device_" + params.deviceUDID,
            'DEVICE-DM',
            {
                action: 'move',
                appId:  params.appId
            },
            req );

        return res.ok( { status: "ok" } );
    }


};

