/**
 * Created by cgrigsby on 8/1/16.
 */
var nodemailer = require('nodemailer');
var jade = require('jade')
var path = require('path')
var jwt = require('jwt-simple')
var secret = sails.config.jwt.secret;

var transport = nodemailer.createTransport(sails.config.mailing.emailConfig); 
var configs = true;
if (!sails.config.jwt || !sails.config.mailing){
    configs = false;
    sails.log.warn("NO CONFIG FOR JWT OR MAILING")
}

module.exports = {

    inviteEmail: function (email, name, venue, role) {

        if(!configs){
            sails.log.debug("CANNOT SEND MAIL DUE TO MISSING CONFIG")
            return null;
        }

        var viewVars = {
            name: name,
            venue: venue.name,
            role: role
        };
        viewVars.url = inviteUrl(sails.config.mailing.inviteUrl,
            email, venue, role, sails.config.mailing.inviteSub)
        sendMail(viewVars, "inviteemail.jade",
            "You have been invited to Ourglass!", email)
    },
    
    inviteNewUser: function(email){
        if(!configs){
            sails.log.debug("CANNOT SEND MAIL DUE TO MISSING CONFIG")
            return null;
        }
        sendMail({url: sails.config.mailing.inviteUrl}, "invitenewuser.jade", "You have been invited to Ourglass!", email)
    },

    genericEmail: function ( emailObj ) {
        if ( !configs ) {
            sails.log.debug( "CANNOT SEND MAIL DUE TO MISSING CONFIG" )
            return null;
        }
        sendMail( { emailbody: emailObj.body }, "genericemail.jade", "Thanks for Using Ourglass!", emailObj.sendTo )
    },

    inviteRole: function (email, name, venue, role) {
        if(!configs){
            sails.log.debug("CANNOT SEND MAIL DUE TO MISSING CONFIG")
            return null;
        }
        var viewVars = {
            name: name,
            venue: venue.name,
            role: role
        };
        viewVars.url = inviteUrl(sails.config.mailing.inviteRoleUrl,
            email, venue, role, sails.config.mailing.roleSub)

        sendMail(viewVars, "inviterole.jade",
            "You have been invited to manage a venue", email)

    },

    adReviewNotification: function () {
        if(!configs){
            sails.log.debug("CANNOT SEND MAIL DUE TO MISSING CONFIG")
            return null;
        }

        var viewVars = {
            url: sails.config.mailing.login
        }

        User.find()
            .populate('auth')
            .then(function (users) {
                return _.filter(users, function (u) {
                    return RoleCacheService.hasAdminRole(u.roles)
                })
            })
            .then(function (us) {
                //sails.log.debug(us)
                var emails = "";
                us.forEach(function (u) {
                    //sails.log.debug(u)
                    emails += u.auth.email + ","
                })
                return emails;
            })
            .then(function (e) {
                sendMail(viewVars, "adreview.jade",
                    "You have an Advertisement to review", e) 
            })
            .catch(function (err) {
                sails.log.debug("Server error in mailing service", err)
            })

    },

    adRejectNotification: function (userId, name, reason) {
        if(!configs){
            sails.log.debug("CANNOT SEND MAIL DUE TO MISSING CONFIG")
            return null;
        }
        var viewVars = {
            url: sails.config.mailing.login,
            name: name,
            reason: reason
        };

        Auth.findOne({user: userId})
            .then(function (a) {
                if (a) {

                    sendMail(viewVars, 'adrejection.jade',
                        "You're advertisement has been reviewed", a.email)
                }
                else return new error("Shit hit the fan")
            })
            .catch(function (err) {
                sails.log.debug("Server error in mailing service", err)
            })
        
    }
}

var sendMail = function (viewVars, template, subject, mailTo) {
    var templatePath = path.normalize(__dirname + "/../../views/emails/" + template);
    var html = jade.renderFile(templatePath, viewVars);

    var mailOptions = {
        from: "no-reply@ourglass.tv", // sender address
        subject: subject,
        text: html, // plaintext body
        html: html, // html body
        to: mailTo
    };

    transport.sendMail(mailOptions, mailCallback);

}

var mailCallback = function (error, info) {
    if (error) {
        sails.log.error("ERROR emailing!");
        sails.log.error(error);
    } else {
        sails.log.info('Message sent: ' + info.response);
    }
};


var inviteUrl = function (url, email, venue, role, subject) {
    var issued = Date.now();
    var uuid = require('node-uuid');
    var moment = require('moment')();
    var expiration = moment.add(sails.config.jwt.expDays, 'days');


    var payload = {
        sub: subject,
        exp: expiration,
        nbf: issued,
        iat: issued,
        jti: uuid.v1(),
        email: email,
        venue: venue.id,
        role: role
    }

    var token = jwt.encode(payload, secret)

    return url + "?token=" + token;

}


