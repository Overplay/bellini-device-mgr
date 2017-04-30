/*********************************

 File:       index.js
 Function:   CRON job for doing periodic syncs with Bellini Core
 Copyright:  OurglassTV TV
 Date:       4/27/17 10:59 AM
 Author:     mkahn

 Enter detailed description

 **********************************/

var Promise = require('bluebird');
var _ = require('lodash');

var disabled = true; // right now, we get venues from 2000, so this hook is not needed anymore.

module.exports = function bcSyncHook(sails) {

    var cronDelay = 0;

    return {

        configure: function () {
            
            if (sails.config.uservice && sails.config.uservice.bcSyncSettings ) {
                sails.log.debug("Bellini Core sync enabled");
                cronDelay = sails.config.uservice.bcSyncSettings.cronDelay || 15000;
            } else {
                sails.log.debug("Bellini Core sync is disabled");
            }

        },

        initialize: function (cb) {
            if (!cronDelay || disabled ) {
                sails.log.warn("There's no config file or its BC Sync hook is disabled... ");
                return cb();
            }
            
            sails.log.debug('BC Sync will sync with this period: ' + cronDelay / 1000 + 's');

            setTimeout(sails.hooks.bcsynchook.sync, 5000);
            return cb();

        },

        sync: function () {

            var prereqs = {
                localVenues: Venue.find({}),
                // TODO when we lock down blueprints, this will fail!
                bcVenues: ProxyService.get('http://localhost:2000/api/v1/venue').then(function(d){ return d.body })
            }

            Promise.props( prereqs )
                .then( function(venues){

                    sails.log.silly("Syncing venues. There are "+venues.bcVenues+ " on BC and "+venues.localVenues+" locally");
                    var localUUIDs = _.map(venues.localVenues, 'uuid');
                    var remoteUUIDs = _.map(venues.bcVenues, 'uuid');

                    var markedForDeath = _.difference(localUUIDs, remoteUUIDs);
                    sails.log.silly( markedForDeath.length + " obsolete entries found" );

                    markedForDeath.forEach(function(uuid){
                        Venue.destroy({ uuid: uuid })
                            .then( function(model){
                                sails.log.debug("Venue nuked");
                            })
                            .catch( function ( err ) {
                                sails.log.error( "Error destroying venue: " + err.message );
                            } )
                    });

                    venues.bcVenues.forEach( function(venue){

                        var litevenue = _.pick( venue, [ 'name', 'address', 'uuid', 'virtual' ] );
                        Venue.updateOrCreate({ uuid: venue.uuid }, litevenue )
                            .then( function(v){
                                sails.log.debug("Venue updated or created from BC");
                            })
                            .catch( function(err){
                                sails.log.error("Error updating venue: "+err.message);
                            })
                    })


                } );


            setTimeout( sails.hooks.bcsynchook.sync, cronDelay );

        }


    }


};