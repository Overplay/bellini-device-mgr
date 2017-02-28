/**
 * ActivationController
 *
 * @description :: Server-side logic for managing Activations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /*
    Creates a random 6 digit code and assigned it to a new device object with the given name
    Device is not active until registered  (code is removed by entering for it) 
     */
    generateCode: function (req, res) {

        var code = '';
        var codeInUse = true;

        //prevent the code from being a duplicate
        async.whilst(function () {
            return codeInUse;
            }, function (next) {
                code = Math.random().toString(36).substr(2, 6).toUpperCase();

                Device.findOne({regCode: code})
                    .then(function (device) {
                        sails.log.debug(device);
                        if (!device)
                            codeInUse = false; // NO device with the code found

                    })
                    .catch(function (err) {
                        sails.log.debug("this is bad...");
                        codeInUse = false;
                        return res.notFound({error: err});
                    });
                sails.log.debug(code)

            }, function (err) {
            }
        );


        var deviceObj = req.allParams();
        //expecting name, location, venue
        if (!deviceObj.name || !deviceObj.venue)
            return res.badRequest({error: "Missing device params"})

        //todo test Venue existence?

        deviceObj.regCode = code;
        

        Device.create(deviceObj)
            .then(function (device) {
                //sails.log.debug(device, "created");
                return res.ok({code: device.regCode});

            })
            .catch(function (err) {
                return res.serverError({error: err}); //give out error (will only show error info if not in production) 
            })

    }

};

