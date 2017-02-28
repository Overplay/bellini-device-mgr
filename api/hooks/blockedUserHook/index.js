/**
 * Created by cgrigsby on 8/16/16.
 */

var jwt = require('jwt-simple')
module.exports = function blockedUserHook(sails) {

    var userConfig;
    var cronDelay;


    return {

        configure: function () {
            if (!sails.config.hooks.userCleaner || !sails.config.hooks.userCleaner.hookEnabled) {
             sails.log.warn("There's no config file for user or its hook is disabled... ");
             }

            userConfig = sails.config.hooks.userCleaner;
        },

        initialize: function (cb) {
            if (!userConfig || !userConfig.hookEnabled) {
             sails.log.warn("There's no config file for device or its hook is disabled... ");
             return cb();
             }
            cronDelay = userConfig.cleanDelay || (1000 * 60 * 60 * 12);
            sails.log.debug('User cleaner will clean with this period: ' + cronDelay / 1000 + 's');

            setTimeout(sails.hooks.blockeduserhook.clean, cronDelay);


            return cb();

        },

        clean: function () {
            //step through devices and delete ones that aren't registered after the timeout

            var now = Date.now()

            //date.now
            Auth.find({blocked: true, validateToken: {'!': ''}})
                .then(function (auths) {

                    auths.forEach(function (auth) {

                        // decode the token
                        return ValidateToken.findOne(auth.validateToken)
                            .then(function (t) {
                                var token = jwt.decode(t.token, sails.config.waterlock.jsonWebTokens.secret);

                                // If token is expired
                                if (token.exp <= now) {
                                    //expired token, remove user and auth 

                                    return User.destroy(auth.user)
                                        .then(function (u) {
                                            return Auth.destroy(auth)
                                                .then(function (a) {
                                                    sails.log.debug(u, "destroyed")
                                                })
                                        })
                                        .catch(function (err) {
                                            sails.log.debug("blocked user hook", err)
                                        })

                                }
                            })
                        

                    })

                })
                .catch(function (err) {
                    sails.log.debug("Huge problem", err)
                });



            setTimeout(sails.hooks.blockeduserhook.clean, cronDelay);

        }


    }


};