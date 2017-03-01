/**
 * OGDeviceController
 *
 * @description :: Server-side logic for managing Ogdevices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var Promise = require( 'bluebird' );

module.exports = {

    /**
     * Register a new device for the first time
     * @param req
     * @param res
     * @returns {*}
     */
    registerDevice: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        // TODO: Shouldn't blindly toss all params into the model!! [mak]
        OGDevice.create( params )
            .then( function ( device ) {
                return res.ok( device );
            } )
            .catch( function ( err ) {
                if ( err.code == 'E_VALIDATION' )
                    return res.badRequest( { error: "Already registered" } );

                return res.serverError( err );
            } );
    },

    associateWithVenue: function ( req, res ) {

        if ( req.method != 'POST' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID || !params.venue )
            return res.badRequest( { error: 'missing parameters' } );

        var preconditions = {
            device: OGDevice.findOneByDeviceUDID( params.deviceUDID ),
            venue:  Venue.findOne( params.venue )
        };

        Promise.props( preconditions )
            .then( function(resp){

            if ( !resp.venue)
                return res.badRequest( { error: "No such venue" } );

            if ( !resp.device )
                return res.badRequest( { error: "No such device" } );

            var device = resp.device;
            device.atVenue = resp.venue.id;
            device.save()
                .then( function(){
                    return res.ok(device)
                })
                .catch( function ( err ) {
                    return res.serverError(err)
                });

        })
        .catch( res.serverError );

    }
};

