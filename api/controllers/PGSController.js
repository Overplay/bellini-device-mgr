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

module.exports = {


    grid: function ( req, res ) {

        if ( req.method != 'GET' )
            return res.badRequest( { error: 'bad verb' } );

        var params = req.allParams();

        if ( !params.deviceUDID )
            return res.badRequest( { error: 'no udid' } );

        OGDevice.findOne( { deviceUDID: params.deviceUDID } )
            .then( function ( dev ) {

                if ( !dev )
                    return res.badRequest( { error: "no such device" } );

                // TODO this extra 5266D default on the end should be removed when all OGDevices
                // have the guideInfo field attached.
                var lineupId = (dev && dev.guideInfo && dev.guideInfo.lineupId) || "5266D";

                request.get( "http://104.131.145.36:1338/tvmediaproxy/fetch/" + lineupId )
                    .then( function ( d ) {
                        return res.ok( d.body );
                    } )
                    .catch( function ( err ) {
                        return res.serverError( err );
                    } );


            })
            .catch( res.serverError );


    }

}
