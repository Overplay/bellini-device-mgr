/**
 * AppDataController
 *
 * @description :: Server-side logic for managing Appdatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require( 'bluebird' );

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
                        forVenueId:    device.atVenueUUID,
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
    initialize: function ( req, res ) {

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

        OGDevice.findOne( { deviceUDID: params.deviceUDID })
            .then( function(device){

                if (!device){
                    return res.badRequest({ error: "no such device" });
                }

                // ok, at this point we need to grab the ids for the A+D and A+V entries
                var promises = [
                    // A+D
                    AppData.findOne( {
                        forDeviceUDID: params.deviceUDID,
                        forAppId: params.appid } ),
                    // A+V
                    AppData.findOne( {
                        forAppId:      params.appid,
                        forVenueId:    device.atVenueUUID,
                        forDeviceUDID: 'venue'
                    } )];

                return Promise.all(promises);

            })
            .then( function ( models ) {
                AppData.subscribe( req, models );
                return res.ok( models )
            } )
            .catch( res.serverError );

    }

};

