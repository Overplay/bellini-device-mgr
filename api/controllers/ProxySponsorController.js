/**
 * Created by mkahn on 3/6/17.
 */

var path = require('path');
var request = require( 'superagent-bluebird-promise' );
var Promise = require( "bluebird" );

function decorateMediaEP( entry ) {
    entry.mediaBaseUrl = sails.config.uservice.sponsorProxy.endpoint + '/media/download/';
    return entry;
};


// TODO clean this up using proxy service
module.exports = {

    all: function ( req, res ) {

        if (!(sails.config.uservice && sails.config.uservice.sponsorProxy))
            return res.serverError({error: 'Bad sponsor proxy setup. This is not recoverable'});

        // var proxypath = sails.config.uservice.sponsorProxy.endpoint +
        //     sails.config.uservice.sponsorProxy.allAds;

        var proxypath = sails.config.uservice.sponsorProxy.endpoint +
            '/ad?where={"reviewState":"Accepted", "paused":false}';

        request.get( proxypath )
            .then( function(d){
                return res.ok(d.body.map( decorateMediaEP ));
            })
            .catch( function(err){
                return res.serverError(err);
            } );

    },

    venue: function ( req, res ) {

        if ( !(sails.config.uservice || !sails.config.uservice.sponsorProxy) )
            return res.serverError( { error: 'Bad sponsor proxy setup. This is not recoverable' } );

        var params = req.allParams();
        const uuid = params.id || params.venueUUID || params.uuid;
        if (!uuid )
            return res.badRequest({ error: "need venueUUID, sparky! "});

        var proxypath = sails.config.uservice.sponsorProxy.endpoint +
            sails.config.uservice.sponsorProxy.adsForVenue + uuid;

        request.get( proxypath )
            .then( function ( d ) {
                return res.ok( d.body.map( decorateMediaEP ) );
            } )
            .catch( function ( err ) {
                return res.serverError( err );
            } );

    }
}