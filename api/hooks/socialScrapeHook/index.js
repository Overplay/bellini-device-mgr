/*********************************

 File:       index.js
 Function:   CRON job for doing periodic social scrapes
 Copyright:  OurglassTV TV
 Date:       4/5/17 10:59 AM
 Author:     mkahn

 Enter detailed description

 **********************************/

var scrape = require('./lib/scrape');

module.exports = function socialScrapeHook(sails) {

    var cronSettings;
    var cronDelay;

    return {

        configure: function () {
            
            if (sails.config.socialscraper && sails.config.socialscraper.cronSettings ) {
                sails.log.debug("Social scraping enabled");
                cronSettings = sails.config.socialscraper.cronSettings;
            } else {
                sails.log.debug("Social scraping is disabled since there is no socialscraper.cronSettings");
            }

        },

        initialize: function (cb) {
            if (!cronSettings || !cronSettings.hookEnabled) {
                sails.log.warn("There's no config file or its hook is disabled... ");
                return cb();
            }
            
            cronDelay = cronSettings.cronDelay || (1000 * 60 * 10);
            sails.log.debug('Social Scraper will clean with this period: ' + cronDelay / 1000 + 's');
            setTimeout(sails.hooks.socialscrapehook.scrape, cronDelay);
            return cb();

        },
        
        dbmaint: scrape.maint,

        scrape: function () {
            //step through devices and delete ones that aren't registered after the timeout

            TwitterService.authenticate()
                .then( function(){

                    return SocialScrape.find( { source: 'twitter' } )
                        .then( function ( scrapes ) {

                            var chain = Promise.resolve();

                            scrapes.forEach( function ( scrape ) {

                                chain = chain.then( function () {

                                    return TwitterService.runScrape( scrape );
                                } )


                            } );

                            return chain;

                        } );



                })
                .then( function(){

                    sails.log.verbose("Twitter scrape process completed without errors")
                })
                .catch( function(e){

                    sails.log.error("Something bad happened with Twitter scrape chain: "+e.message);
                })


            setTimeout( sails.hooks.socialscrapehook.scrape, cronDelay);

        }


    }


};