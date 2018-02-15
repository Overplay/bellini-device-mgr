/**
 * VenueController
 *
 * @description :: Server-side logic for managing venues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Yelp = require( 'yelp' );

const yelp = new Yelp( {
    consumer_key:    "BAos8_zEjNvVuptYHO8tyA",
    consumer_secret: "lU4QHPKu7XdO-8IRIdH-1gpgWxg",
    token:           "4zCE_xN7zdbdrGgxiM-_kuFER25FWLEh",
    token_secret:    "WLHkoScUyrkJCW1WS7c_fXe_ekI"
} );

const USE_BC_VENUES = true;

module.exports = {


    /**
     * ADDED BY MITCH
     *
     */

    devices: function ( req, res ) {

        if ( req.method !== 'GET' )
            return res.badRequest( { error: "BAD VERB" } );

        OGDevice.find({ atVenueUUID: req.allParams().atVenueUUID })
            .then(function(devices){

                if (!req.allParams().getstatus){
                    return res.ok(devices);
                } else {
                    // we need to get the status of each device...or do we?
                }

            })
            .catch(res.serverError);

    },


    joinroom: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method !== 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a venueUUID
        const params = req.allParams();

        if ( !params.venueUUID )
            return res.badRequest( { error: "Missing venueUUID" } );

        var room = "venue_" + params.venueUUID;

        sails.sockets.join( req, room );

        // Broadcast a notification to all the sockets who have joined
        // the "funSockets" room, excluding our newly added socket:
        sails.sockets.broadcast( room,
            room,
            { message: 'Welcome to the Venue room for ' + params.venueUUID },
            req );

        return res.ok( { message: 'joined' } );

    },

    message: function ( req, res ) {

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method !== 'POST' )
            return res.badRequest( { error: "That's not how to message, sparky!" } );

        //OK, we need a venueId
        const params = req.allParams();

        if ( !params.venueUUID || !params.message )
            return res.badRequest( { error: "Missing params" } );

        const room = "venue_" + params.venueUUID;
        sails.sockets.broadcast( room, room, params.message, req );

        return res.ok( params );

    },

    findByUUID: function ( req, res ) {

        if ( req.method !== 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        //OK, we need a venueId
        var params = req.allParams();

        if ( !params.id && !params.uuid )
            return res.badRequest( { error: "Missing uuid" } );

        var includeVirtual = !!params.includeVirtual;

        var uuid = params.id || params.uuid;

        var query = includeVirtual ? { uuid: uuid } : { uuid: uuid, virtual: false };

        var promise = USE_BC_VENUES ? BCService.Venue.findByUUID( uuid ) : Venue.findOne( query );
        var ehandler = USE_BC_VENUES ? res.proxyError : res.serverError;

        promise
            .then( function ( venue ) {

                if ( !venue ) {
                    return res.notFound( { error: "no venue with that UUID" } );
                }

                return res.ok( venue );
            } )
            .catch( ehandler );

    },

    // replaces blueprint, easier to secure
    all: function ( req, res ) {

        if ( req.method !== 'GET' )
            return res.badRequest( { error: "Bad Verb" } );

        // With an existing database this is an ass-painer becuase some have virtual as undefined
        // var query = { virtual: false };
        // if ( req.allParams().virtual && req.allParams().virtual==true ){
        //     query = {}
        // }

        if (USE_BC_VENUES){

            BCService.Venue.findAllReal()
                .then(res.ok)
                .catch( res.proxyError );

        } else {

            Venue.find( { virtual: false } )
                .then( res.ok )
                .catch( res.serverError );

        }

    },


};

