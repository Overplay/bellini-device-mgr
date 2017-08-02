/**
 * AppDataController
 *
 * @description :: Server-side logic for managing Appdatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require( 'bluebird' );

function responseChainError(message, responseFunc){
    var error = new Error( message );
    error.responseFunc = responseFunc;
    return error;
}

function hasUDIDandAppId( req ) {

    var params = req.allParams();
    if ( !params.deviceUDID || !params.appid )
        return undefined;

    return params;

}

function retrieveAppDataAndDevice( dataScope, appid, deviceid ) {

    var devicePromise = OGDevice.findOne( { deviceUDID: deviceid } );

    if ( dataScope === 'device' ) {

        return Promise.props( {
            data:   AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } ),
            device: devicePromise
        } );

    } else {
        // scope is venue
        return devicePromise
            .then( function ( device ) {
                if ( !device )
                    throw new Error( "No such device" );

                return Promise.props( {
                    data:   AppData.findOne( {
                        forAppId:      appid,
                        forVenueUUID:    device.atVenueUUID,
                        forDeviceUDID: 'venue'
                    } ),
                    device: devicePromise
                } );

            } )
    }
}

module.exports = {

    getAllForApp: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { "error": "bad verb" } );

        var params = req.allParams();
        if ( !params.appid ) {
            return res.badRequest( { "error": "How about an app id, pal?" } );
        }

        AppData.find( { forAppId: params.appid } )
            .then( function ( models ) {
                return res.ok( models );
            } )
            .catch( res.err )

    },

    appDataForDevice: function ( req, res ) {

        var params = req.allParams();
        var appid = params.appid;
        var deviceid = params.deviceid;
        var dataScope = params.scope || 'device';

        switch ( req.method ) {

            case 'POST':

                sails.log.silly( "POSTING app data for: " + appid + ' on device ' + deviceid + ' with scope: ' + dataScope );


                //AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                retrieveAppDataAndDevice( dataScope, appid, deviceid )
                    .then( function ( props ) {
                        if ( props.data ) {
                            return res.badRequest( { error: "model already exists, try a PUT genius!" } );
                        }

                        var newAppData = (dataScope === 'device') ?
                            {
                                forAppId:      appid,
                                forDeviceUDID: deviceid,
                                data:          params.data || {}
                            } :
                            {
                                forAppId:      appid,
                                data:          params.data || {},
                                forVenueId:    props.device.atVenueUUID,
                                forDeviceUDID: 'venue'
                            };

                        AppData.create( newAppData )
                            .then( function ( model ) {
                                if ( !model ) {
                                    return res.serverError( { error: "could not make model" } );
                                }
                                return res.ok( model );
                            } )
                            .catch( res.serverError )

                    } )
                    .catch( res.serverError );
                break;

            case 'PUT':
                sails.log.silly( "PUTTING app data for: " + appid + " on device " + deviceid );

                var newAppData = { data: params.data || {} };

                //AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                retrieveAppDataAndDevice( dataScope, appid, deviceid )
                    .then( function ( props ) {
                        if ( !props.data ) {
                            return res.badRequest( { error: "model does not exist, try a POST" } );
                        }

                        AppData.update( { id: props.data.id }, newAppData )
                            .then( function ( model ) {
                                if ( !model || !model.length ) {
                                    return res.serverError( { error: "unable to update model" } );
                                }
                                // TODO could this ever not be an array?
                                var m = model[ 0 ];
                                AppData.publishUpdate( m.id, m.data, req );
                                return res.ok( m.data );
                            } )
                            .catch( res.serverError );
                    } )
                    .catch( res.serverError );

                break;

            case 'GET':
                sails.log.silly( "GETTING app data for: " + appid + " on device " + deviceid );

                //AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                retrieveAppDataAndDevice( dataScope, appid, deviceid )
                    .then( function ( props ) {
                        if ( !props.data ) {
                            return res.badRequest( { error: "model does not exist!" } );
                        }
                        return res.ok( props.data )
                    } )
                    .catch( res.serverError );

                break;

            case 'DELETE':
                sails.log.silly( "DELETE app data for: " + appid + " on device " + deviceid );

                // TODO: These feels vaguely dirty
                retrieveAppDataAndDevice( dataScope, appid, deviceid )
                    .then( function ( props ) {
                        if ( !props.data ) {
                            return res.badRequest( { error: "model does not exist" } );
                        }
                        return AppData.destroy( { id: props.data.id } )
                            .then( res.ok )
                            .catch( res.serverError )
                    } );

                break;

            default:
                return res.ok( "Not implemented" );
        }

    },

    // TAKES in appid, deviceid, venueid
    // GET appdata/:appid/:deviceid
    // GET appdata

    // get /appmodel/:appid/:deviceid
    // http://localhost:2001/appmodel/erik/12345

    appDataForDeviceOld: function ( req, res ) {

        var params = req.allParams();
        var appid = params.appid;
        var deviceid = params.deviceid;
        var dataScope = params.scope || 'device';

        switch ( req.method ) {

            case 'POST':

                sails.log.silly( "POSTING app data for: " + appid + ' on device ' + deviceid + ' with scope: ' + dataScope );


                //AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                retrieveAppData( dataScope, appid, deviceid )
                    .then( function ( model ) {
                        if ( model ) {
                            return res.badRequest( { error: "model already exists, try a PUT genius!" } );
                        }

                        var newAppData = (dataScope === 'device') ?
                            {
                                forAppId:      appid,
                                forDeviceUDID: deviceid,
                                data:          params.data || {}
                            } :
                            {
                                forAppId: appid,
                                data:     params.data || {}


                            };

                        AppData.create( newAppData )
                            .then( function ( model ) {
                                if ( !model ) {
                                    return res.serverError( { error: "could not make model" } );
                                }
                                return res.ok( model );
                            } )
                            .catch( res.serverError )

                    } )
                    .catch( res.serverError );
                break;

            case 'PUT':
                sails.log.silly( "PUTTING app data for: " + appid + " on device " + deviceid );

                var newAppData = { forAppID: appid, forDeviceUDID: deviceid, data: params.data || {} };
                AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                    .then( function ( model ) {
                        if ( !model ) {
                            return res.badRequest( { error: "model does not exist, try a POST" } );
                        }

                        AppData.update( { forAppId: appid, forDeviceUDID: deviceid }, newAppData )
                            .then( function ( model ) {
                                if ( !model || !model.length ) {
                                    return res.serverError( { error: "unable to update model" } );
                                }
                                // TODO could this ever not be an array?
                                var m = model[ 0 ];
                                AppData.publishUpdate( m.id, m.data, req );
                                return res.ok( m.data );
                            } )
                            .catch( res.serverError );
                    } )
                    .catch( res.serverError );

                break;

            case 'GET':
                sails.log.silly( "GETTING app data for: " + appid + " on device " + deviceid );

                AppData.findOne( { forAppId: appid, forDeviceUDID: deviceid } )
                    .then( function ( model ) {
                        if ( !model ) {
                            return res.badRequest( { error: "model does not exist!" } );
                        }
                        return res.ok( model )
                    } )
                    .catch( res.serverError );

                break;

            case 'DELETE':
                sails.log.silly( "DELETE app data for: " + appid + " on device " + deviceid );

                AppData.destroy( { forAppId: appid, forDeviceUDID: deviceid } )
                    .then( function ( model ) {
                        if ( model.length == 0 ) {
                            return res.badRequest( { error: "model does not exist" } );
                        }
                        return res.ok( model );
                    } )
                    .catch( res.serverError );

                break;

            default:
                return res.ok( "Not implemented" );
        }

    },


    // Returns appdata for app for device, or creates and entry from the prototype in the App entry
    // TODO: Add precondition to make sure Device is in DB
    initializeOld: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "bad verb" } );

        var params = hasUDIDandAppId( req );
        if ( !params )
            return res.badRequest( { error: "missing udid or appid" } );

        AppData.findOne( { forDeviceUDID: params.deviceUDID, forAppId: params.appid } )
            .then( function ( model ) {
                if ( model )
                    return res.ok( model );

                App.findOne( { appId: params.appid } )
                    .then( function ( app ) {
                        if ( !app )
                            return res.badRequest( { error: "no such app" } );
                        AppData.create( {
                            forAppId:      params.appid,
                            forDeviceUDID: params.deviceUDID,
                            data:          app.defaultModel
                        } )
                            .then( res.ok )
                            .catch( res.serverError );
                    } )
                    .catch( res.serverError );
            } )
            .catch( res.serverError );

    },

    tidy: function( req, res) {

        if ( req.method != 'DELETE' )
            return res.badRequest( { error: "bad verb" } );

        var params = req.allParams();
        if (!params.appid){
            return res.badRequest({ error: 'no app id'});
        }

        AppData.destroy({ forAppId: params.appid })
            .then(res.ok)
            .catch(res.serverError)

    },

    initialize: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "bad verb" } );

        var params = hasUDIDandAppId( req );
        if ( !params )
            return res.badRequest( { error: "missing udid or appid" } );

        App.findOne( { appId: params.appid } )
            .then( function ( app ) {

                if ( !app ) {
                    throw responseChainError("No such app", res.badRequest);
                }

                var dataPromises = {
                    device: retrieveAppDataAndDevice( 'device', params.appid, params.deviceUDID ),
                    venue:  retrieveAppDataAndDevice( 'venue', params.appid, params.deviceUDID ),
                    app:    app
                }

                return Promise.props( dataPromises );

            } )
            .then( function ( maybeDataModels ) {

                var dataPromises = {};
                var defaultModel = maybeDataModels.app.defaultModel;

                if ( maybeDataModels.device && maybeDataModels.device.data ) {
                    dataPromises.device = maybeDataModels.device.data;
                } else {

                    sails.log.silly( "Creating A+D data for this device." );

                    var deviceModel = {
                        forAppId:      params.appid,
                        forDeviceUDID: params.deviceUDID,
                        data: defaultModel.hasOwnProperty( '_device_' ) ? defaultModel._device_ : defaultModel._venue_ || defaultModel
                    };

                    dataPromises.device = AppData.create( deviceModel );

                }

                if ( maybeDataModels.venue && maybeDataModels.venue.data ) {
                    dataPromises.venue = maybeDataModels.venue.data;
                } else {

                    sails.log.silly( "Creating A+V data for " + params.appid + " on venue " + maybeDataModels.venue.device.atVenueUUID );
                    var venueData = {
                        forAppId:      params.appid,
                        forDeviceUDID: 'venue',
                        data:          defaultModel.hasOwnProperty( '_venue_' ) ? defaultModel._venue_ : defaultModel._device_ || defaultModel,
                        forVenueUUID:  maybeDataModels.venue.device.atVenueUUID
                    };

                    dataPromises.venue = AppData.create( venueData );

                }

                return Promise.props(dataPromises);

            } )
            .then( res.ok )
            .catch( function ( error ) {
                if (!error.responseFunc){
                    return res.serverError(error);
                } else {
                    return error.responseFunc( { error: error.message } )
                }
            } )


    },


    // Returns appdata for app for device, or creates and entry from the prototype in the App entry
    // TODO: This is a lot of code duplication
    initializeVenueData: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "bad verb" } );

        var params = hasUDIDandAppId( req );
        if ( !params )
            return res.badRequest( { error: "missing udid or appid" } );

        //AppData.findOne( { forDeviceUDID: params.deviceUDID, forAppId: params.appid } )
        retrieveAppDataAndDevice( 'venue', params.appid, params.deviceUDID )
            .then( function ( props ) {
                if ( props.data )
                    return res.ok( props.data );

                App.findOne( { appId: params.appid } )
                    .then( function ( app ) {
                        if ( !app )
                            return res.badRequest( { error: "no such app" } );


                        var vappD = {
                            forAppId:      params.appid,
                            data:          app.defaultModel || {},
                            forVenueId:    props.device.atVenueUUID,
                            forDeviceUDID: 'venue'
                        };

                        AppData.create( vappD )
                            .then( res.ok )
                            .catch( res.serverError );
                    } )
                    .catch( res.serverError );
            } )
            .catch( res.serverError );

    },

    // WEBSOCKETS subscription method. Must be called over sockets
    subscribe: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method !== 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.appid || !params.deviceUDID )
            return res.badRequest( { error: "Missing params" } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( function ( device ) {

                if ( !device ) {
                    return res.badRequest( { error: "no such device" } );
                }

                // ok, at this point we need to grab the ids for the A+D and A+V entries
                var promises = [
                    // A+D
                    AppData.findOne( {
                        forDeviceUDID: params.deviceUDID,
                        forAppId:      params.appid
                    } ),
                    // A+V
                    AppData.findOne( {
                        forAppId:      params.appid,
                        forVenueUUID:    device.atVenueUUID,
                        forDeviceUDID: 'venue'
                    } ) ];

                return Promise.all( promises );

            } )
            .then( function ( models ) {
                AppData.subscribe( req, models );
                return res.ok( models )
            } )
            .catch( res.serverError );

    }

};

