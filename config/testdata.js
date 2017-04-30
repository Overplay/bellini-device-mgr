/**
 * Created by rhartzell on 5/6/16.
 */

//Note: test data will be duplicated if being run on a cluster! 
var moment = require('moment')
var Promise = require('bluebird');


var self = module.exports.testdata = {

    installTestData: false,
    eraseOldData: false,


    // TODO this does fuck all right now as it should!
    install: function () {

        if ( !self.installTestData ) {
            sails.log.debug( "Skipping test data installation." );
            return;
        }

        var chain = Promise.resolve();

        if ( self.eraseOldData ) {
            sails.log.debug( "Erasing old test data installation." );

            var destruct = [
                Auth.destroy( {} ),
                User.destroy( {} ),
                OGLog.destroy( {} )
            ];

            chain = chain.then( function () {
                return Promise.all( destruct )
                    .then( function () {
                        sails.log.debug( "All test models destroyed." );
                    } );
            } )
        }

    }

};
