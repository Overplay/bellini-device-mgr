/**
 * OGLogController
 *
 * @description :: Server-side logic for managing Oglogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    upload: function (req, res) {

        var params = req.allParams();

        if (!params.logType)
            return res.badRequest({error: "Missing log type"});
        if (!params.message)
            return res.badRequest({error: "Missing message"});
        if (!params.deviceUniqueId && !params.deviceId)
            return res.badRequest({error: "Missing device id"});
        if (!params.loggedAt)
            return res.badRequest({error: "Missing logged at time"});

        params.loggedAt = new Date(params.loggedAt);
        sails.log.debug(params);

        OGLog.create(params)
            .then( function (log) {
                if (log.logType == "alert") {
                    // return TwilioService.sendText('+13033249551', "RED ALERT!!!!");
                }
                return res.ok(log)
            })

            .catch( function (err) {
                sails.log.debug("error creating log")
                return res.serverError({error: err});
            })

    },

    //if device id in OGLog, include ad id? this is complicated 
    //more in the ad controller
    impressions: function (req, res) {
        OGLog.find({where: { logType: 'impression'}, sort: 'loggedAt DESC' })
            .then(function(logs) {
                return res.ok(logs); //all logs
            })
            .catch(function(err){
                return res.serverError({error: err})
            })
    },

    deviceHeartbeat: function (req, res) {

        if (!req.allParams().id)
            return res.badRequest({error: "Missing device id"});

        var id = req.allParams().id;

        //Why the f was this line ever here: MAK
        //OGLog.find({ where: { logType: 'heartbeat'}, sort: 'loggedAt DESC'})
        //TODO test with uniqueDeviceId: id in query if deviceId now instead of unique TOODODODODO
        //OGLog.find({ where: { logType: 'heartbeat', deviceId: id}, sort: 'loggedAt DESC'})
        OGLog.find( { where: { logType: 'heartbeat', deviceUniqueId: id }, limit: 10, sort: 'loggedAt DESC' } )
            .then( res.ok )
            .catch(function(err){
                return res.serverError({error: err})
            })
    },

    getAll: function (req, res) {
        OGLog.find()
            .then(res.ok)
            .catch(function(err){
                return res.serverError({error: err})
            })
    }


    //maybe make endpoints for each type and have it sortable 
    //like impressions could take an ad or user id and query 
};

