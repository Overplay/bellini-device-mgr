/**
 * Created by mkahn on 3/1/17.
 */

//Note: test data will be duplicated if being run on a cluster! 
var moment = require('moment')
var Promise = require('bluebird');

var stockApps = [
    {
        appId:        "io.ourglass.nowserving",
        defaultModel: { ticketNumber: 0 }
    },
    {
        appId:        "io.ourglass.ogcrawler",
        defaultModel: {
            "messages":       [ "Ourglass TV", "Check Ourglass out at www.ourglass.tv" ],
            "twitterQueries": [ "@Warriors" ],
            "hideTVTweets":   false
        }
    },
    {
        appId:        "io.ourglass.waitinglist",
        defaultModel: {
            "parties": []
        }
    },
    {
        appId:        "io.ourglass.bltest",
        defaultModel: {
            mydata: [{ song: "My Milkshake" }, { song: "Mr. ROboto "}]
        }
    } ];

var self = module.exports.stockapps = {

    installStockApps: true,
    eraseOldApps: true,

    install: function () {

        if ( !self.installStockApps ) {
            sails.log.debug( "Skipping stock app installation." );
            return;
        }

        var chain = Promise.resolve();

        if ( self.eraseOldApps ) {
            sails.log.debug( "Erasing old stock app installation." );

            var destruct = [
                App.destroy( {} )
            ];

            chain = chain.then( function () {
                return Promise.all( destruct )
                    .then( function () {
                        sails.log.debug( "All app related entries destroyed." );
                    } );
            } )
        }

        return chain.then( function () {
            return Promise.map( stockApps, function ( app ) {
                return App.findOrCreate( app );
            } )
        } )

    }
};
