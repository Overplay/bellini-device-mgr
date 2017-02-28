/**
 * SMSController
 *
 * @description :: Server-side logic for managing SMS
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	


  /**
   * `SMSController.notify()`
   */
    notify: function (req, res) {
        var params = req.allParams();
        var num;

        if (!params.destination)
            return res.badRequest({ "error" : "Missing destination phone number" });
        if (!params.deviceId)
            return res.badRequest({ "error" : "Missing device ID" });
        if (!params.payload)
            return res.badRequest({ "error" : "Missing message body" });
        // if (!params.jwt)
        //     return res.badRequest("Missing JWT");

        if (isNaN(params.destination) && params.destination.charAt(0) !== '+')
            return res.badRequest({ "error" : "Invalid destination" });

        if (params.destination.length == 10)
            params.destination = "+1" + params.destination;

        Device.findOne(params.deviceId)
            .populate('venue')
            .then( function (dev) {
                if (!dev)
                    return res.notFound({ error : 'Device not found' });
                else if (!dev.venue)
                    return res.badRequest({ error : 'Device does not have an associated venue' });
                else {
                    var textHistory = dev.venue.textHistory;
                    textHistory.push(Date.now());
                    num = textHistory.length;
                    return Venue.update(dev.venue.id, { textHistory: textHistory })
                        .then( function () {
                            return TwilioService.sendText(params.destination, params.payload)
                                .then( function (message) {
                                    return res.ok({ message : num + " messages sent in the last minute"});
                                })
                                .catch( function (err) {
                                    return res.serverError({ error: err });
                                })
                        })
                }
            })
            .catch(function(err){
                return res.serverError({error: err})
            })
    }
};

