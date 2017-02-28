/**
 * Created by ryanhartzell on 9/8/16.
 */
var request = require('superagent');
var moment = require('moment');
var _ = require('lodash');
var async = require('async');

//var baseURL = "http://localhost:1337";
var baseURL = "http://104.131.145.36"
//var baseURL = "http://107.170.209.248"


request
    .get(baseURL + '/api/v1/device')
    .end(function(err, res){
        var devices = res.body;
        async.forEach(devices,
            function (dev, cb) {
                var log = {
                    logType: 'heartbeat',
                    message: {
                        softwareVersions: {
                            amstelBright: "1.0.5",
                            aqui: "0.0.84395abz",
                            android: "MMB29M"
                        },
                        installedApps: [
                            "Waiting List",
                            "Shuffleboard"
                        ]
                    }
                };
                var times = _.random(50);

                _.times(times, function () {
                    //generate log with random device
                    log.deviceUniqueId = dev.id;
                    log.loggedAt = new Date(moment().hours(_.random(23)).subtract(_.random(3), "days").toISOString()); //TODO randomize hours
                    var dur = moment.duration(_.random(259200000));
                    var hours = (dur.hours() < 10 ? "0" : "") + dur.hours();
                    var min = (dur.minutes() < 10 ? "0" : "") + dur.minutes();
                    var sec = (dur.seconds() < 10 ? "0" : "") + dur.seconds();
                    log.message.uptime = hours + ":" + min + ":" + sec;
                    request
                        .post(baseURL + '/api/v1/oglog')
                        .send(log)
                        .end(function(err, res){
                            //console.log(err)
                        })
                })
                cb();
            },
            function (err) {
                if (err)
                    console.log("fuck", err)
                else{
                    console.log("Done")

                }
            })
    });
