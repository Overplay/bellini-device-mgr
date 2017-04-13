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
            device: OGDevice.findOne( { deviceUDID: params.deviceUDID } ),
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
                action: 'kill',
                appId:  params.appId
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
    },

    findByUDID: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( function ( dev ) {
                if ( !dev )
                    return res.badRequest( { error: "no such device" } );

                res.ok( dev );
            } )
            .catch( res.serverError );

    },

    pingcloud: function(req, res) {
        return res.ok({ response: "Bellini-DM is here."});
    },

    changechannel: function(req, res){

        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.channel )
            return res.badRequest( { error: "Missing channel" } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( function ( dev ) {
                if ( !dev )
                    return res.badRequest( { error: "no such device" } );


                // This lets the webapps know, albeit indirectly
                sails.sockets.broadcast( "device_" + params.deviceUDID,
                    'DEVICE-DM',
                    {
                        action: 'tune',
                        channel: parseInt(params.channel)
                    } );
                res.ok( { message: "thank you for your patronage" } );
            } )
            .catch( res.serverError );

    },

    programchange: function( req, res ){
    
        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.tvShow )
            return res.badRequest( { error: "Missing show info" } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( function ( dev ) {
                if ( !dev )
                    return res.badRequest( { error: "no such device" } );

                // TODO this should be validated as proper TV Show!!!!
                dev.currentProgram = params.tvShow;
                dev.save();
                // This lets the webapps know, albeit indirectly
                sails.sockets.broadcast( "device_" + params.deviceUDID,
                    'DEVICE-DM',
                    {
                        action: 'new-program'
                    } );
                res.ok( { message: "thank you for your patronage" } );
            })
            .catch( res.serverError );

    },

    appstatus: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        var preconditions = {
            device: OGDevice.findOne( { deviceUDID: params.deviceUDID } ),
            // Only return apps we can actually control via mobile app
            apps:   App.find( { 'appType': [ 'widget', 'crawler' ] } )
        }

        Promise.props( preconditions )
            .then( function ( results ) {
                if ( !results.device )
                    return res.badRequest( { error: "no such device" } );

                var runningApps = results.device.runningApps || [];
                var runningAppIds = runningApps.map( function ( a ) { return a.appId; } );
                _.remove( results.apps, function ( app ) {
                    return runningAppIds.indexOf( app.appId ) > -1;
                } );
                return res.ok( { available: results.apps, running: runningApps } );

            } )
            .catch( res.serverError );

    },

    //TODO needs a refactor. A lot of the actions have replicated code!
    commandack: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.command )
            return res.badRequest( { error: "Missing command you're acking" } );

        switch ( params.command ) {

            case 'launch':
            case 'kill':
            case 'move':

                if ( !params.appId )
                    return res.badRequest( { error: "Missing appId" } );

                var preconditions = {
                    device: OGDevice.findOne( { deviceUDID: params.deviceUDID } ),
                    app:    App.findOne( { appId: params.appId } )
                }

                Promise.props( preconditions )
                    .then( function ( results ) {

                        if ( !results.device )
                            return res.badRequest( { error: "no such device" } );

                        if ( !results.app )
                            return res.badRequest( { error: "no such app" } );

                        switch ( params.command ) {

                            case 'launch':
                                // Get the just launched app type
                                var launchedAppType = results.app.appType;
                                // Now we need to remove any such app from currently running

                                _.remove( results.device.runningApps, function ( a ) {
                                    return a.appType == launchedAppType;
                                } );
                                results.device.runningApps.push( results.app );
                                results.device.save();
                                return res.ok( results.device );
                                break;

                            case 'kill':

                                _.remove( results.device.runningApps, function(a){
                                    return a.appId == results.app.appId;
                                })
                                results.device.save();
                                return res.ok( results.device );
                                break;

                            case 'move':
                                return res.ok( { iheadthat: 'but i did nothing'})

                        }


                    } )
                    .catch( res.serverError );

                break;


            default:
                res.badRequest( { error: "No such command" } );


        }


    }

};

