/**
 * Created by erikphillips on 3/1/17.
 */

var sails = require('sails');

before(function(done) {

    // Increase the Mocha timeout so that Sails has enough time to lift.
    this.timeout(5000);

    sails.lift({
        // configuration for testing purposes
        log: { // this should work to silent the sails app logs
            level: 'silent'
        }
    }, function(err) {
        if (err) return done(err);
        // here you can load fixtures, etc.
        done(err, sails);
    });
});

after(function(done) {
    // here you can clear fixtures, etc.
    sails.lower(done);
    done();
});