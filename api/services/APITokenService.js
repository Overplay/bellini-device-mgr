/*
* Created by Cole Grigsby 9/13/2016
 */


var jwt = require('jwt-simple')
var uuid = require('node-uuid');


module.exports = {
    createToken: function(deviceUniqueId){
        //unique ID will be mac or something 
        var issued = Date.now();

        var token = jwt.encode({
            iss: deviceUniqueId, //Should this be checked by AJ too? 
            sub: sails.config.AJPGSsecurity.subject,
            aud: sails.config.AJPGSsecurity.audience,
            nbf: issued,
            iat: issued,
            jti: uuid.v1()
        }, sails.config.AJPGSsecurity.secret);

        return token; 
    },

    validateToken: function(token, cb){

        
        try {
            var decoded = jwt.decode(token, sails.config.AJPGSsecurity.secret)

            var _reqTime = Date.now()

            if (_reqTime <= decoded.nbf)
                cb({error: "This token is early"})
            if (sails.config.AJPGSsecurity.subject !== decoded.sub)
                cb({error: "Invalid token for this request "})
            if (sails.config.AJPGSsecurity.audience !== decoded.aud)
                cb({error: "Invalid token for this request "})

            cb(null, token);
        }
        catch(e){
            cb({error: "invalid token"})
        }


    }
}