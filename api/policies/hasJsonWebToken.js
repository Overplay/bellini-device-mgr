/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

// TODO: Should be able to combine this with the other auth policies to create a single
// Policy.


//Waterlock methods to get user and stuff too so we should figure it out
module.exports = function (req, res, next) {


    if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }

    waterlock.validator.validateTokenRequest(req, function (err, user) {
        if (err) {
            return res.forbidden({error: err});
        }

        // valid request
        next();
    });
};
