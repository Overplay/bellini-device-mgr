/*********************************

 File:       TwitterService.js
 Function:   Runs Twitter Queries
 Copyright:  Ourglass TV
 Date:       4/5/17 11:18 AM
 Author:     mkahn


 **********************************/

var btoa = require( 'btoa' );
var util = require( 'util' );
var Promise = require( 'bluebird' );
var request = require( 'superagent-bluebird-promise' );
var _ = require( 'lodash' );
var Twitter = require( 'twitter' );

var accessToken;
var twitterClient;
var CONSUMER_KEY = sails.config.socialscraper.twitter.CONSUMER_KEY;
var CONSUMER_SECRET = sails.config.socialscraper.twitter.CONSUMER_SECRET;

module.exports = {

    authenticate: function(){

        var bearerToken = CONSUMER_KEY + ":" + CONSUMER_SECRET;
        var b64BearerToken = btoa( bearerToken );

        var twitterOauthURL = "https://api.twitter.com/oauth2/token";
        return request
            .post( twitterOauthURL )
            .set( 'Authorization', "Basic " + b64BearerToken )
            .set( 'Content-Type', "application/x-www-form-urlencoded;charset=UTF-8" )
            .send( "grant_type=client_credentials" )
            .then( function ( res ) {
                console.log( res.body );
                if ( res.body.access_token != undefined ) {
                    accessToken = res.body.access_token;
                    twitterClient = new Twitter({
                        consumer_key:    CONSUMER_KEY,
                        consumer_secret: CONSUMER_SECRET,
                        bearer_token:    accessToken
                    })
                    return accessToken;
                }
                accessToken = undefined;
                throw new Error( "Could not authenticate!" );
            } );
    
    },

    runScrape: function ( socialScrapeObj ) {
    
        if (!twitterClient)
            return Promise.reject(new Error("Not logged into Twitter. Call authenticate() first!"));

        if ( socialScrapeObj.source != 'twitter' )
            return Promise.reject(new Error("This is not a twitter scrape!"));

        if ( !socialScrapeObj.queryString )
            return Promise.reject( new Error( "No query string for this scrape!" ) );


        return twitterClient.get( 'search/tweets', { q: socialScrapeObj.queryString })
            .then( function(data){
                sails.log.silly("Twitter response: "+data);
                socialScrapeObj.lastResult = data;
                socialScrapeObj.lastScrapeTime = new Date();
                socialScrapeObj.save(); // this returns a rather useless promise that just lets us know it worked...
                return socialScrapeObj;
            });
        
    }
}