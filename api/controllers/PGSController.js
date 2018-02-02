/*********************************

 File:       PGSController.js
 Function:   Program Guide Proxy Calls
 Copyright:  Ourglass TV
 Date:       4/18/17 9:09 AM
 Author:     mkahn

 Enter detailed description

 **********************************/


var request = require( 'superagent-bluebird-promise' );
var Promise = require( "bluebird" );
var _ = require( "lodash" );
var moment = require( 'moment' );

class ResponseError extends Error {
    constructor( message, responseFn, json ) {
        super( message );
        this.responseFn = responseFn;
        this.json = json;
    }
}

function processLineup( lineup ) {

    return _.map( lineup, function ( chanLup ) {

        chanLup.channel[ "logoUrl" ] = "http://cdn.tvpassport.com/image/station/100x100/" + chanLup.channel.logoFilename;

        // Remove any shows that are over
        _.remove( chanLup.listings, function ( listing ) {
            // Times come from TVMedia in utc
            const showEndsAt = moment( listing.listDateTime + " +0000" ).add( listing.duration, "m" );
            const now = moment().utcOffset( 0 );
            const isOver = showEndsAt.isBefore( now );
            return isOver;

        } );

        return chanLup;
    } );

}


function lineupForDevice( deviceUDID, searchQuery ) {
    return OGDevice.findOne( { deviceUDID: deviceUDID } )
        .then( function ( dev ) {

            if ( !dev )
                throw { message: "no such device", code: 1 };

            // TODO this extra 5266D default on the end should be removed when all OGDevices
            // have the guideInfo field attached.
            var lineupId = (dev && dev.guideInfo && dev.guideInfo.lineupId) || "5266D";
            return lineupId;
        } )
        .then( function ( lineupId ) {
            // Fetching from AJPGS, for now
            return PGService.getCachedLineup( lineupId )
                .then( function ( lineup ) {
                    const rval = _.map( lineup, function ( chanLup ) {

                        chanLup.channel[ "logoUrl" ] = "http://cdn.tvpassport.com/image/station/100x100/" + chanLup.channel.logoFilename;

                        // Remove any shows that are over
                        _.remove( chanLup.listings, function ( listing ) {
                            // Times come from TVMedia in utc
                            var showEndsAt = moment( listing.listDateTime + " +0000" ).add( listing.duration, "m" );
                            var now = moment().utcOffset( 0 );
                            var isOver = showEndsAt.isBefore( now );
                            return isOver;

                        } );

                        if ( searchQuery ) {
                            _.remove( chanLup.channel, function ( channel ) { //This should remove all channels that aren't in the search.
                                return channel.name.toLowerCase().indexOf( searchQuery.toLowerCase() ) == -1;
                            } );
                        }

                        return chanLup;
                    } );
                    return rval;
                } )
        } );

}

module.exports = {


    grid: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        lineupForDevice( params.deviceUDID )
            .then( res.ok )
            .catch( res.serverError );

    },

    listingsforchannel: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        if ( !params.channel || _.isNumber( params.channel ) )
            return res.badRequest( { error: 'missing or bad channel number' } );

        lineupForDevice( params.deviceUDID )
            .then( function ( listings ) {
                var rval = {};
                rval = _.find( listings, { channel: { channelNumber: parseInt( params.channel ) } } );
                res.ok( rval );
            } )
            .catch( res.serverError );

    },

    // TODO: this method uses the OGDevice object as the canonical source of the shannel that is on the TV since the
    // above function seems to be broken.
    listingsforchannel2: function ( req, res ) {

        if ( req.method !== 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        let params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( ( device ) => {
                if ( !device ) throw new ResponseError( 'No such device', res.notFound, { error: 'no such device' } );

                let channel;
                try {
                    channel = device.currentProgram.channelNumber;
                } catch ( err ) {
                    throw new ResponseError( 'Device has no channel info', res.badRequest, { error: 'device has no TV info' } );
                }

                const lineupId = (device && device.guideInfo && device.guideInfo.lineupId) || "5266D";

                return Promise.props( { lineup: PGService.getCachedLineup( lineupId ), channel: channel } );

            } )

            .then( function ( props ) {
                let rval = {};
                rval = _.find( props.lineup, { channel: { channelNumber: parseInt( props.channel ) } } );
                res.ok( rval );
            } )
            .catch( res.serverError );

    },

    bestposition: function ( req, res ) {

        const params = req.allParams();

        if ( !params.channel ) {
            return res.badRequest( { error: 'no channel' } );
        }

        if ( !params.deviceUDID ) {
            return res.badRequest( { error: 'no device' } );
        }

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( ( device ) => {

                if ( !device ) {
                    return res.badRequest( { error: 'no such device' } );
                }

                PGService.bestposition( device, params.channel )
                    .then( res.ok )
                    .catch( res.proxyError );

            } )


    },

    serverTime: function ( req, res ) {

        const d = new Date();

        return res.ok( { date: d, ms1970: d.getTime() } );
    }


}
