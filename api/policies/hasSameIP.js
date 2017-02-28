/**
 * has Same req ip
 *
 * @module      :: Policy
 * @description :: checks if the request has an ip that matches 
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

//configuring the localIP will allow us to run AJPGS on its own server and set the address here
module.exports = function (req, res, next) {


    /*if (sails.config.policies.wideOpen) {
        sails.log.debug("In wideOpen policy mode, so skipping this policy!");
        return next();
    }
    else {*/
    sails.log.debug(req.host == sails.config.localIp)
    if (req.host == sails.config.localIp)
        return next();
    //}

    return res.forbidden({error: "Incorrect request IP"})
}
