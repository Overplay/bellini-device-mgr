/**
 * SocialScrapeController
 *
 * @description :: Server-side logic for managing Socialscrapes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require( "bluebird" );

module.exports = {

    add: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.appId )
            return res.badRequest( { error: "Missing appId" } );


        var preconditions = {
            device: OGDevice.findOne( { deviceUDID: params.deviceUDID } ),
            // Only return apps we can actually control via mobile app
            apps:   App.findOne( { 'appId': params.appId } )
        }

        Promise.props( preconditions )
            .then( function ( results ) {
                // If we get here, then the App and the Device are real

                if ( results.apps && results.device )
                    return SocialScrape.findOrCreate( { forDeviceUDID: params.deviceUDID, forAppId: params.appId } )

                throw new Error( "No such device or app in system" );

            } )
            .then( function ( ss ) {
                sails.log.debug( ss );
                ss.queryString = params.queryString || '@ourglassTV';
                ss.save();
                TwitterService.runScrape( ss );
                return res.ok( ss );

            } )
            .catch( function ( err ) {
                return res.badRequest( { error: err.message } );
            } )

    },

    delall: function ( req, res ) {

        if ( req.method != 'DELETE' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        // Silly little safety
        if ( !params.auth || !params.auth == 'dddd' )
            return res.badRequest( { error: "Missing key" } );

        SocialScrape.destroy( {} )
            .then( function ( d ) {
                return res.ok( { message: d.length + ' records deleted' } );
            } )
            .catch( function ( err ) {
                return res.badRequest( { error: err.message } );
            } )

    },

    result: function ( req, res ) {

        sails.hooks.socialscrapehook.dbmaint( 'DELETE_ALL' );

        if ( req.method != 'GET' )
            return res.badRequest( { error: "Bad verb" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: "Missing UDID" } );

        if ( !params.appId )
            return res.badRequest( { error: "Missing appId" } );

        SocialScrape.findOne( { forDeviceUDID: params.deviceUDID, forAppId: params.appId } )
            .then( function ( scrape ) {

                if ( !scrape )
                    return res.notFound( { error: 'no such appId, UDID combo' } );

                return res.ok( scrape );
            } )
            .catch( res.serverError );


    }
};

