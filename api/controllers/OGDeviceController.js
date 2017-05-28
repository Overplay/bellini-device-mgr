/**
 * OGDeviceController
 *
 * @description :: Server-side logic for managing Ogdevices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var Promise = require( 'bluebird' );
var util = require('util');

var USE_BC_VENUES = true;

function sendDeviceDM( deviceUDID, message, req ) {

    sails.sockets.broadcast( "device_" + deviceUDID,
        'DEVICE-DM',
        message,
        req );

}

function findVenueByUUID( uuid ) {

    return USE_BC_VENUES ? BCService.Venue.findByUUID( uuid ) :
        Venue.findOne( { uuid: uuid } );

}


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
            venue:  findVenueByUUID( params.venueUUID )
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
                        // Let device know this has changed
                        sendDeviceDM( params.deviceUDID, {
                            action: 'cloud_record_update',
                            change: { atVenueUUID: device.atVenueUUID }
                        }, req );
                        return res.ok( device )
                    } )
                    .catch( function ( err ) {
                        return res.serverError( err )
                    } );

            } )
            .catch( res.serverError );

    },

    changeName: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID || !params.name )
            return res.badRequest( { error: 'missing parameters' } );

        OGDevice.update( { deviceUDID: params.deviceUDID }, { name: params.name } )
            .then( function ( devices ) {

                if ( devices.length == 0 )
                    return res.badRequest( { error: "No device for that UDID" } );

                sendDeviceDM( params.deviceUDID, {
                    action: 'cloud_record_update',
                    change: { name: devices[ 0 ].name }
                }, req );
                return res.ok( devices[ 0 ] );

            } )
            .catch( res.serverError );

    },

    // OK, so the only guy who needs to receive Websocket messages via this room, is the device.
    // So each join, will first clean the old room. Otherwise, you get a bunch of members who
    // are the same device. (I think).
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

        var io = sails.io;
        var clients = io.sockets.clients();

        io.of('/').in(room).clients( function(e, c){
            sails.log.silly("SIO in room: "+util.inspect(c));
        });

        // TODO error can be in done obj
        sails.sockets.leaveAll(room, function(done){
            sails.sockets.join( req, room );
            // Broadcast a notification to all the sockets who have joined
            // the "funSockets" room, excluding our newly added socket:
            sails.sockets.broadcast( room,
                'DEVICE-JOIN',
                { message: 'Welcome to the OGDevice room for ' + params.deviceUDID },
                req );

            return res.ok( { message: 'joined' } );

        });


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
                        appType: model.appType || 'widget',
                        ts: new Date().getTime() // hack for multiples
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
                appId:  params.appId,
                ts:     new Date().getTime() // hack for multiples
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

        sails.log.silly( "MOVE called at: " + new Date() + " by IP: " + req.ip );
        sails.log.silly( "------ Subs in Room -------");
        var subs = sails.sockets.subscribers( "device_" + params.deviceUDID);
        sails.log.silly("SUBS: "+ util.inspect(subs));

        sails.sockets.broadcast( "device_" + params.deviceUDID,
            'DEVICE-DM',
            {
                action: 'move',
                appId:  params.appId,
                ts:     new Date().getTime() // hack for multiples
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

                if ( !dev.atVenueUUID ) {
                    return res.ok( dev );
                }

                return Promise.props( { device: dev, venue: findVenueByUUID( dev.atVenueUUID ) } );

            } )
            .then( function ( props ) {

                if ( props.venue ) {
                    props.device.venueName = props.venue.name;
                }

                return res.ok( props.device );

            } )

            .catch( res.serverError );

    },

    findByRegCode: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.regcode )
            return res.badRequest( { error: "Missing reg code" } );

        OGDevice.findOne( { tempRegCode: params.regcode } )
            .then( function ( dev ) {
                if ( !dev )
                    return res.notFound( { error: "no such device" } );

                if ( !dev.atVenueUUID ) {
                    return res.ok( dev );
                }

                return Promise.props( { device: dev, venue: findVenueByUUID( dev.atVenueUUID ) } );

            } )
            .then( function ( props ) {

                if ( props.venue ) {
                    props.device.venueName = props.venue.name;
                }

                return res.ok( props.device );

            } )

            .catch( res.serverError );

    },

    pingcloud: function ( req, res ) {
        return res.ok( { response: "Bellini-DM is here." } );
    },

    regstbpairing: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !req.body && !req.body.carrier )
            return res.badRequest( { error: "Malformed STB data" } );

        OGDevice.update( { deviceUDID: params.deviceUDID }, { pairedTo: req.body } )
            .then( function ( dev ) {
                if ( !dev )
                    return res.badRequest( { error: "no such device" } );

                res.ok( dev );
            } )
            .catch( res.serverError );

    },

    changechannel: function ( req, res ) {

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
                        action:  'tune',
                        channel: parseInt( params.channel ),
                        ts:      new Date().getTime() // hack for multiples
                    } );
                res.ok( { message: "thank you for your patronage" } );
            } )
            .catch( res.serverError );

    },

    programchange: function ( req, res ) {

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
                        action: 'new-program',
                        ts:     new Date().getTime() // hack for multiples
                    } );
                res.ok( { message: "thank you for your patronage" } );
            } )
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

        sails.log.silly( "CMDACK from: "+ params.deviceUDID +
            " for command: "+params.command +
            " called at: " + new Date() );


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

                                _.remove( results.device.runningApps, function ( a ) {
                                    return a.appId == results.app.appId;
                                } )
                                results.device.save();
                                return res.ok( results.device );
                                break;

                            case 'move':
                                return res.ok( { iheadthat: 'but i did nothing' } )

                        }


                    } )
                    .catch( res.serverError );

                break;


            default:
                res.badRequest( { error: "No such command" } );


        }


    },

    regcode: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        // Get all living reg codes...there shouldn't be too many

        OGDevice.find( { tempRegCode: { '!': '' } } )
            .then( function ( waitingOGs ) {

                var codesInUse = _.pluck( waitingOGs, 'tempRegCode' );
                var letters = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];
                var code;

                do {
                    code = _.sample( letters ) + _.random( 0, 9 ) + _.sample( letters ) + _.sample( letters );
                } while ( codesInUse.indexOf( code ) != -1 );

                return OGDevice.update( { deviceUDID: params.deviceUDID }, { tempRegCode: code } );
            } )
            .then( function ( devices ) {

                if ( devices.length == 0 )
                    return res.badRequest( { error: "no such device" } );

                return res.ok( { code: devices[ 0 ].tempRegCode } );
            } )
            .catch( res.serverError );
    },

    all: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad verb" } );

        OGDevice.find( req.query )
            .then( res.ok )
            .catch( res.serverError );


    },

    // TODO this needs some better protection :p
    purge: function (req, res ){
        OGDevice.destroy({})
            .then(res.ok)
            .catch(res.serverError)
    }


};

