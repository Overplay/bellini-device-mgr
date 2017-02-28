/**
 * Created by ryanhartzell on 9/6/16.
 */


module.exports = function limitSMS (req, res, next) {
    var devId = req.param('deviceId');

    Device.findOne(devId)
        .populate('venue')
        .then( function (device) {
            if (!device)
                return res.badRequest({ "error" : "device not found" });
            else {
                var textHistory = _.filter(device.venue.textHistory, function (o) { return o > (Date.now() - (60 * 1000)) });
                Venue.update(device.venue.id, { textHistory: textHistory })
                    .then( function (v) {
                        if (textHistory.length >= 10)
                            return res.forbidden({ "error" : "Text limit reached" });
                        else
                            next();
                    })
            }
        })
        .catch( function (err) {
            return res.serverError(err);
        })
}