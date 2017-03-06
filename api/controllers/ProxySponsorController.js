/**
 * Created by mkahn on 3/6/17.
 */

var path = require('path');
var request = require( 'superagent-bluebird-promise' );
var Promise = require( "bluebird" );

module.exports = {

    all: function ( req, res ) {

        if (!sails.config.sponsorProxy || !sails.config.sponsorProxy)
            return res.serverError({error: 'Bad sponsor proxy setup. This is not recoverable'});

        var proxypath = path.join(sails.config.sponsorProxy.endpoint,
            sails.config.sponsorProxy.allAds);

        request.get( proxypath )
            .then( res.ok )
            .catch( res.badRequest );

    }
}