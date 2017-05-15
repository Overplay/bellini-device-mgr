/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    // MAK, what is this for
    upload: function ( req, res ) {

        var params = req.allParams();

        if ( !params.logType )
            return res.badRequest( { error: "Missing log type" } );
        if ( !params.message )
            return res.badRequest( { error: "Missing message" } );
        if ( !params.deviceUniqueId && !params.deviceId )
            return res.badRequest( { error: "Missing device id" } );
        if ( !params.loggedAt )
            return res.badRequest( { error: "Missing logged at time" } );

        params.loggedAt = new Date( params.loggedAt );
        sails.log.debug( params );

        OGLog.create( params )
            .then( function ( log ) {
                if ( log.logType == "alert" ) {
                    // return TwilioService.sendText('+13033249551', "RED ALERT!!!!");
                }
                return res.ok( log )
            } )

            .catch( function ( err ) {
                sails.log.debug( "error creating log" )
                return res.serverError( { error: err } );
            } )

    },

    heartbeats: function ( req, res ) {

        var deviceUDID = req.allParams().deviceUDID || req.allParams().id;
        var limit = req.allParams().limit || 10;

        if ( deviceUDID )
            return res.badRequest( { error: "Missing device udid" } );

        OGLog.find( { where: { logType: 'heartbeat', deviceUniqueId: deviceUDID }, limit: limit, sort: 'loggedAt DESC' } )
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
    postlog: function (req, res ){

        var allParams = req.allParams();
        if ( !allParams.logType ){
            return res.badRequest({ error: 'no valid logtype' })
        }

        // schema: true is in the model, protecting it from random shit
        OGLog.create(allParams)
            .then(res.ok)
            .catch(res.serverError);

    },

    wipeem: function( req, res ){

        OGLog.destroy({})
            .then( function(r){
                res.ok({ deleted: r.length });
            })
            .catch(res.serverError);

    }


    //maybe make endpoints for each type and have it sortable 
    //like impressions could take an ad or user id and query 
};

