const request = require( 'superagent-bluebird-promise' );
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = {

    bestposition: function ( device, channel ) {

        const url = sails.config.uservice.belliniPGS.url + '/position/findbest?lineup='+
            device.guideInfo.lineupId + '&channel='+channel;

        return ProxyService.get( url )
            .then( function ( resp ) {
                return resp.body;
            } );

    },

    getCachedLineup: function (lineupId){

        const url = sails.config.uservice.belliniPGS.url + '/tvmediaproxy/fetch/' + lineupId;

        return ProxyService.get( url )
            .then( function ( resp ) {
                return resp.body;
            } );

    }
}
