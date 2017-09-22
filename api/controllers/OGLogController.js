/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require( 'bluebird' );

module.exports = {

    // // MAK, what is this for
    // upload: function ( req, res ) {
    //
    //     var params = req.allParams();
    //
    //     if ( !params.logType )
    //         return res.badRequest( { error: "Missing log type" } );
    //     if ( !params.message )
    //         return res.badRequest( { error: "Missing message" } );
    //     if ( !params.deviceUniqueId && !params.deviceId )
    //         return res.badRequest( { error: "Missing device id" } );
    //     if ( !params.loggedAt )
    //         return res.badRequest( { error: "Missing logged at time" } );
    //
    //     params.loggedAt = new Date( params.loggedAt );
    //     sails.log.debug( params );
    //
    //     OGLog.create( params )
    //         .then( function ( log ) {
    //             if ( log.logType == "alert" ) {
    //                 // return TwilioService.sendText('+13033249551', "RED ALERT!!!!");
    //             }
    //             return res.ok( log )
    //         } )
    //
    //         .catch( function ( err ) {
    //             sails.log.debug( "error creating log" )
    //             return res.serverError( { error: err } );
    //         } )
    //
    // },

    heartbeats: function ( req, res ) {

        var deviceUDID = req.allParams().deviceUDID || req.allParams().id;
        var limit = req.allParams().limit || 10;

        if ( deviceUDID )
            return res.badRequest( { error: "Missing device udid" } );

        OGLog.find( {
            where: { logType: 'heartbeat', deviceUniqueId: deviceUDID },
            limit: limit,
            sort:  'loggedAt DESC'
        } )
            .then( res.ok )
            .catch( res.serverError );

    },

    all: function ( req, res ) {
        OGLog.find()
            .then( res.ok )
            .catch( function ( err ) {
                return res.serverError( { error: err } )
            } )
    },

    // NOTE: Policies now pre-check for POST and deviceUDID and it's from a valid device
    postlog: function ( req, res ) {

        var allParams = req.allParams();
        if ( !allParams.logType ) {
            return res.badRequest( { error: 'no valid logtype' } )
        }

        sails.log.silly( "Device: " + req.allParams().deviceUDID + " is posting OGLog file" );
        // schema: true is in the model, protecting it from random shit
        OGLog.create( allParams )
            .then( function ( newLog ) {

                return Promise.props( {
                    newLog: newLog,
                    device: OGDevice.update( { deviceUDID: req.allParams().deviceUDID }, { lastContact: new Date() } )
                } )

            } )
            .then( function ( props ) {
                return res.ok( props.newLog );
            } )
            .catch( res.serverError );

    },

    wipeem: function ( req, res ) {


        OGLog.destroy( {} )
            .then( function ( r ) {
                res.ok( { deleted: r.length } );
            } )
            .catch( res.serverError );

    },

    postFile: function ( req, res ) {

        const destinationFolder = require( 'path' ).resolve( sails.config.appPath, 'data/uploads/logs' );

        const uploadOptions = {
            dirname:  destinationFolder,
            maxBytes: 10 * 1024 * 1024
        };

        req.file( 'file' ).upload( uploadOptions, function whenDone( err, uploadedFiles ) {

            if ( err ) {
                sails.log.error( "File upload error: " + util.inspect( err ) );
                return res.serverError( { error: err.message } );
            }

            // If no files were uploaded, respond with an error.
            if ( (uploadedFiles === undefined) || (uploadedFiles.length === 0) ) {
                return res.badRequest( { error: 'No file(s) uploaded.' } );
            }

            sails.log.silly( "Processing uploaded file." );

            const localFile = uploadedFiles[ 0 ];

            const params = req.allParams();
            const ogLog = {
                logType:    params.logType || 'filelog',
                file:       {
                    path: localFile.fd,
                    file: {
                        size: localFile.size,
                        type: localFile.type
                    }
                },
                deviceUDID: params.deviceUDID,
                loggedAt:   params.loggedAt || new Date(),
                message:    params.message
            };

            OGLog.create( ogLog )
                .then( function ( newLog ) {
                    if ( !newLog )
                        return res.serverError( { error: 'Could not create OGLog!' } );

                    return res.ok( newLog )
                } )
                .catch( res.serverError );

        } );


    },

    getLogFile: function ( req, res ) {


        var logId = req.param( 'id' );
        if ( !logId ) {
            return req.badRequest( { error: "no log id" } );
        }

        OGLog.findOne( logId )
            .then( function ( log ) {

                /**
                 * Throw errors if
                 * 1: path is empty
                 * 2: file doesn't exist
                 * 3: error on read
                 */

                if ( !log ) {
                    return res.notFound( { error: "no such log" } );
                } else if ( !(log.file && log.file.path) ) {
                    return res.badRequest( { error: "log has no file" } );
                }

                var SkipperDisk = require( 'skipper-disk' );
                var fileAdapter = SkipperDisk( /* optional opts */ );

                // Stream the file down
                fileAdapter.read( log.file.path )
                    .on( 'error', function ( err ) {

                        var err1 = new verror( err, "Download media `%s` read failed", logId );
                        err1.status = 500;
                        err1.propertyName = "path";
                        err1.propertyValue = log.file.path;
                        return res.negotiate( err1 );
                    } )
                    .pipe( res );

            })
            .catch(res.serverError);

    }
};

