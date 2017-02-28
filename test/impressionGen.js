//Cole Grigsby 9/7/2016

var request = require('superagent');
var moment = require('moment');
var _ = require('lodash');
var async = require('async');

//var baseURL = "http://localhost:1337";
//var baseURL = "http://104.131.145.36"
var baseURL = "http://107.170.209.248"


request
.get(baseURL + '/api/v1/device')
.end(function(err, res){
    var devices = res.body;
    request
        .get(baseURL + '/api/v1/ad')
        .end(function(err, res){
            var ads = res.body;
            async.each(ads,
                function (ad, cb) {
                    var log = {
                        logType: 'impression',
                        message: {
                            adId: ad.id
                        }
                    };
                    var times = _.random(100);

                    _.times(times, function () {
                        //generate log with random device
                        log.deviceUniqueId = devices[_.random(devices.length -1)].id
                        log.loggedAt = new Date(moment().subtract(0, 'days').hours(_.random(23))).toISOString()//.add(1, 'days')) //TODO randomize hours
                        request
                            .post(baseURL + '/api/v1/oglog')
                            .send(log)
                            .end(function(err, res){
                                //console.log(res.body)
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
        })

    });