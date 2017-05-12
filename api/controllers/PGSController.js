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
var _ = require("lodash");
var moment = require('moment');


function lineupForDevice(deviceUDID){
    return OGDevice.findOne( { deviceUDID: deviceUDID } )
        .then( function ( dev ) {

            if ( !dev )
                throw { message: "no such device", code: 1 };

            // TODO this extra 5266D default on the end should be removed when all OGDevices
            // have the guideInfo field attached.
            var lineupId = (dev && dev.guideInfo && dev.guideInfo.lineupId) || "5266D";
            return lineupId;
        })
        .then( function(lineupId){
            // Fetching from AJPGS, for now
            return request.get( "http://104.131.145.36:1338/tvmediaproxy/fetch/" + lineupId )
                .then( function ( d ) {
                    var lup = d.body;
                    var rval = _.map(lup, function(chanLup){

                        chanLup.channel["logoUrl"] = "http://cdn.tvpassport.com/image/station/100x100/" + chanLup.channel.logoFilename;

                        // Remove any shows that are over
                        _.remove(chanLup.listings, function(listing){
                            // Times come from TVMedia in utc
                            var showEndsAt = moment( listing.listDateTime + " +0000").add( listing.duration, "m");
                            var now = moment().utcOffset(0);
                            var isOver = showEndsAt.isBefore(now);
                            return isOver;

                        });

                        return chanLup;
                    });
                    return rval;
                } )
        });

}

module.exports = {


    grid: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        lineupForDevice(params.deviceUDID)
            .then(res.ok)
            .catch(res.serverError);

    },

    listingsforchannel: function (req, res ){

        if ( req.method != 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        if ( !params.channel || _.isNumber(params.channel) )
            return res.badRequest( { error: 'missing or bad channel number' } );

        lineupForDevice(params.deviceUDID)
            .then( function(listings){
                var rval = {};
                rval = _.find(listings, { channel: { channelNumber: parseInt(params.channel) }});
                res.ok(rval);
            })
            .catch(res.serverError);

    }




}
