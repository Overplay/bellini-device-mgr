var request = require( 'superagent-bluebird-promise' );

module.exports = {

    Venue: {

        findByUUID: function ( uuid ) {

            return ProxyService.get( sails.config.uservice.belliniCore.url + '/venue/findByUUID', { uuid: uuid } )
                .then( function ( resp ) {
                    return resp.body;
                } );
        },

        findAllReal: function () {

            return ProxyService.get( sails.config.uservice.belliniCore.url + '/venue/all', { virtual: false } )
                .then( function ( resp ) {
                    return resp.body;
                } );

        }

    },

    User: {

        checkJwt: function ( jwt ) {

            return request
            .get( sails.config.uservice.belliniCore.url + '/user/checkjwt' )
            .set( 'Authorization', 'Bearer ' + jwt )
            .then( function ( resp ) {
                    return resp.body;
                } );

        }

    }

}