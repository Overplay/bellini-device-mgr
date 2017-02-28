/**
 * Created by eadams on 10/22/15.
 */
var util = require('util');
var verror = require('verror');
var Promise = require('bluebird');
var _ = require('lodash');

var twilioSettings = {};

/**
 * Add the config to config/local.js
 *
 *   twilio: {
 *     startupDelay: 10000 // In milliseconds
 *     , loopRestartOnSuccessDelay: (1000 * 60 * 0.5) // In milliseconds
 *     , loopRestartOnFailDelay: (1000 * 60 * 0.5) // In milliseconds
 *     , sweepThresholdHours: 1 //(1/30.0) // In hours
 *     , accountSid: ''
 *     , authToken: ''
 *     , from: "+14089164024"
 *
 *   }
 *
 */

module.exports = {

    sendText:  function(phoneNumber, messageObj) {
        return new Promise(function (resolve, reject) {
            if(!sails.config.twilio) {
                return reject({error: "No twilio Configuration"});

            }
            // Twilio Credentials
            var accountSid = sails.config.twilio.accountSid;
            var authToken = sails.config.twilio.authToken;
            var from = sails.config.twilio.from;

            //require the Twilio module and create a REST client
            var client = require('twilio')(accountSid, authToken);

            var body = messageObj;

            sails.log.verbose('body: ' + util.inspect(body));

            client.messages.create({
                to: phoneNumber, // Must be in "+14088885147",
                from: from,
                body: body
            }, function (err, message) {
                if (err) {
                    sails.log.error('err: ' + util.inspect(err));
                    return reject(new verror.VError(err, "twilio Send Message"));
                } else {
                    return resolve(message);
                }
            });
        });
    }
};