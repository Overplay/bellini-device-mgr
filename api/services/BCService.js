var request = require( 'superagent-bluebird-promise' );
var Promise = require('bluebird');
var _ = require('lodash');

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

            if (jwt.indexOf('Bearer ')<0){
                jwt = 'Bearer ' + jwt;
            }

            return request
            .get( sails.config.uservice.belliniCore.url + '/user/checkjwt' )
            .set( 'Authorization', jwt )
            .then( function ( resp ) {
                    return resp.body;
                } );

        }

    },

    Media: {

        download: function ( id, res ) {

            return request
                .get( sails.config.uservice.belliniCore.url + '/media/download/' + id )
                //.set( 'Authorization', 'Bearer ' + jwt )
                .pipe(res);

        }

    },


    UserInteraction: {

        log: function( reqOrId, data ) {

            var userId;

            if ( _.isObject( reqOrId) ){
                if ( !reqOrId.bcuser ) {
                    sails.log.error( "Requested User Interaction log with no BC User. Ignoring." );
                    return Promise.resolve();
                } else {
                    userId = reqOrId.bcuser && reqOrId.bcuser.id;
                }
            } else if ( _.isString( reqOrId)){
                userId = reqOrId;
            }

            var postData = _.extend({ userId: userId }, data );

            return ProxyService.post( sails.config.uservice.belliniCore.url + '/userinteraction', postData )
                .then( function ( resp ) {
                    return resp.body;
                } );
        }

    }

}