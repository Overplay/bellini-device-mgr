/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing Advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');
var excel = require('node-excel-export');
var moment = require('moment');

var AD_RUNNING = { reviewed: true, accepted: true, deleted: false, paused: false };

module.exports = {

    /*
     getMedia returns the media objects of an advertisement
     It steps through the array of media ids and finds the Media entries with those ids and pushes them to a returned array 
     */
    getMedia: function (req, res) {

        if (!req.allParams().id) {
            return res.badRequest({error: "no id"});
        }
        var chain = Promise.resolve();

        Ad.findOne(req.allParams().id)
            .then(function (a) {

                var media = a.advert.media;
                _.forEach(media, function (val, key) {
                    if (val != null) {
                        chain = chain.then(function () {
                            return Media.findOne(val)
                                .then(function (m) {
                                    media[key] = m;
                                })
                        })
                    }

                })

                chain = chain.then(function () {
                    //sails.log.debug(media)
                    return res.ok(media);
                });

                return chain;
            })
            .catch(function (err) {
                //something bad
                sails.log.debug({error: err});
                return res.serverError({error: err});
            })

    },

    review: function (req, res) {
        //if rejecting - send email
        var params = req.allParams();

        if (typeof params.accepted == 'undefined' || !params.id) {
            return res.badRequest({error: "Invalid req params"})
        }
        else {
            Ad.update(params.id, {accepted: params.accepted, reviewed: true})
                .then(function (updated) {
                    if (updated.length == 1) {
                        if (params.accepted == false) { //rejected by admin 
                            MailingService.adRejectNotification(updated[0].creator, updated[0].name, "not meeting guidelines")
                        }

                        return res.json(updated[0])
                    }
                    else return res.serverError({ "error" : "Too many or too few ads updated"})
                })
                .catch(function (err) {
                    sails.log.debug(err)
                    return res.serverError({error: err})
                })
        }
    },

    pauseOrResume: function (req, res) {
        var params = req.allParams();
        if (!params.id) {
            return res.badRequest({ "error" : "Invalid req Params" })
        }
        else {
            Ad.findOne(params.id)
                .then(function (ad) {
                    ad.paused = !ad.paused;
                    ad.save(function (err) {
                        if (err) {
                            sails.log.debug("ad save err", err)
                            return res.serverError({error: err})
                        }
                        else
                            return res.ok(ad)
                    })
                })
        }
    },

    setDelete: function (req, res) {
        var params = req.allParams();
        if (!params.id || typeof params.delete == 'undefined') {
            return res.badRequest({error: "Invalid req Params"})
        }
        else {
            Ad.findOne(params.id)
                .then(function (ad) {
                    ad.deleted = params.delete;
                    ad.save(function (err) {
                        if (err) {
                            sails.log.debug("ad save err", err)
                            return res.serverError({error: err})
                        }
                        else
                            return res.ok(ad)
                    })
                })
        }
    },

    exportExcel: function (req, res) {

        if (!req.allParams().id)
            return res.badRequest({error: "Missing ad id"});

        var id = req.allParams().id;
        var chain = Promise.resolve();
        var ad, impressions;

        var styles = {
            headerDark: {
                fill: {
                    fgColor: { rgb: 'FF999999' }
                },
                font: { sz: "14" },
                border: {
                    bottom: {
                        style: 'medium',
                        color: { rgb: "00000000" }
                    }
                },
                alignment: {
                    vertical: "center",
                    horizontal: "center"
                }
            },
            cellLight: {
                fill: {
                    fgColor: { rgb: 'FFF0F0F0' }
                },
                alignment: { wrapText: false }
            },
            cellDate: {
                fill: { fgColor: { rgb: 'FFF0F0F0' }},
                alignment: { wrapText: false },
                numFmt: "mmm d, yyyy - h:mm AM/PM"
            },
            cellDark: {
                fill: {
                    fgColor: { rgb: 'FF999999' }
                }
            }
        };

        chain = chain.then( function () {
            return Ad.findOne({id: id})
                .then( function (a) {
                    if (!a)
                        return res.error('Could not find ad');
                    else {
                        ad = a;
                        return OGLog.find({ logType: "impression" })
                            .sort('loggedAt DESC')
                            .then( function (logs) {
                                impressions = _.filter(logs, { message: { adId: id }});
                                return impressions;
                            })
                    }
                })
        });

        chain = chain.then( function () {
            if (impressions) {
                async.each(impressions, function (log, cb) {
                        return Device.findOne(log.deviceUniqueId) //TODO this is gonna change what key is used
                            .populate('venue')
                            .then(function (dev) {
                                var venue = dev.venue;
                                var addr = venue.address;
                                log.venue = venue.name +
                                    " (" + addr.street +
                                    (addr.street2 ? " " + addr.street2 : "") +
                                    " " + addr.city +
                                    ", " + addr.state +
                                    " " + addr.zip + ")";
                                cb()
                            })
                            .catch(function (err) {
                                return cb(err)
                            })
                    },
                    function (err) {
                        if (err) {
                            return res.serverError(err)
                        }
                        else {
                            var report = excel.buildExport(
                                [{
                                    name: 'Advertisement Info',
                                    specification: {
                                        name: {
                                            displayName: 'Name',
                                            width: 120,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        description: {
                                            displayName: 'Description',
                                            width: 120,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        reviewed: {
                                            displayName: 'Reviewed',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        accepted: {
                                            displayName: 'Accepted',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        paused: {
                                            displayName: 'Paused',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        },
                                        deleted: {
                                            displayName: 'Deleted',
                                            width: 80,
                                            headerStyle: styles.headerDark,
                                            cellStyle: styles.cellLight
                                        }
                                    },
                                    data: [{
                                        name: ad.name,
                                        description: ad.description,
                                        // creator: ad.creator.firstName + " " + ad.creator.lastName,
                                        reviewed: ad.reviewed ? "True" : "False",
                                        accepted: ad.accepted ? "True" : "False",
                                        paused: ad.paused ? "True" : "False",
                                        deleted: ad.deleted ? "True" : "False"
                                    }]
                                },
                                    {
                                        name: 'Impressions',
                                        specification: {
                                            venue: {
                                                displayName: "Venue",
                                                width: 200,
                                                headerStyle: styles.headerDark,
                                                cellStyle: styles.cellLight
                                            },
                                            loggedAt: {
                                                displayName: "Time Shown",
                                                width: 160,
                                                headerStyle: styles.headerDark,
                                                cellStyle: styles.cellDate
                                            }
                                        },
                                        data: impressions
                                    }]
                            );

                            res.attachment('AdReport.xlsx');
                            return res.send(200, report);
                        }
                    })
            }
        })

        return chain;
    },

    forReview: function (req, res) {
        Ad.find({where: {reviewed: false}, sort: 'createdAt ASC'})
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError({error: err})
            })
    },

    //use this for when an advertiser updates ads == gets sent to admin for review
    editAd: function (req, res) {
        var params = req.allParams()

        if (!params.ad) {
            return res.badRequest({error: "no ad given for updated"})
        }
        else {
            params.ad.reviewed = false;
            params.ad.accepted = false;
            return Ad.update(params.ad.id, params.ad)
                .then(function (ads) {
                    if (ads.length > 1) {
                        return res.serverError({error: "no freaking way. multiple ads updated"})
                    }
                    else {
                        MailingService.adReviewNotification()
                        return res.ok(ads[0])
                    }
                })
                .catch(function (err) {
                    return res.serverError({error: err})
                })
        }

    },

    getAccepted: function (req, res) {
        Ad.find(AD_RUNNING)
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError({error: err})
            })
    },

    //TODO add a date filter on this or front end?
    impressions: function (req, res) {
        var params = req.allParams();
        if (!params.id) {
            return res.badRequest({error: "No Id provided"})
        }
        var id = params.id;

        Ad.findOne(id)
            .then(function(ad){
                if (!ad){
                    return res.notFound({error: "Ad Id does not exist"})
                }
                else {
                    var adLogs;
                    return OGLog.find({logType: 'impression'})
                        .then(function (logs) {
                            adLogs = _.filter(logs, {message: {adId: id}})
                            async.each(adLogs, function (log, cb) {
                                    return Device.findOne(log.deviceUniqueId) //TODO this is gonna change what key is used
                                        .populate('venue')
                                        .then(function (dev) {
                                            log.venue = dev.venue;
                                            cb()
                                            return null; 
                                        })
                                        .catch(function (err) {
                                            return cb(err)
                                        })
                                },
                                function (err) {
                                    if (err) {
                                        return res.serverError({error: err})
                                    }
                                    else {
                                        return res.ok(adLogs)

                                    }

                                })
                            return null; 
                        })

                }
            })

            .catch(function (err) {
                return res.serverError({error: err})
            })
    },

    //TODO lots of impressions = long load time
    //maybe an impression endpoint that does hourly counts for each ad for a certain date
    dailyCount: function (req, res) { // TODO only get session users ads :)
        //var start = new Date().getTime()

        var params = req.allParams()
        if (!params.date) {
            return res.badRequest({error: "No date given"})
        }
        var query = {
            logType: 'impression',
            loggedAt: {
                '>': new Date(moment(params.date, "YYYY-MM-DD").startOf('day')),
                '<': new Date(moment(params.date, "YYYY-MM-DD").endOf('day'))
            }
        }
        OGLog.find(query)
            .then(function (logs) {
                if (params.id) {
                    logs = _.filter(logs, {message: {adId: params.id}})
                    return logs
                }
                else {
                    return Ad.find({creator: req.session.user.id}) //TODO this is bad
                        .then(function (ads) {
                            var ids = _.map(ads, 'id')
                            logs = _.filter(logs, function (l) {
                                return (_.findIndex(ids, function (id) {
                                    return id == l.message.adId
                                }) > -1)
                            });
                            return logs;
                        })
                        .catch(function(err){
                            return res.serverError({error: err})
                        })


                }


               
            })
            .then(function(logs){
                async.each(logs, function (log, cb) {
                    return Ad.findOne(log.message.adId)
                        .then(function (ad) {
                            if(!ad) {
                                sails.log.debug(log)
                                return res.notFound({error: "Bad ad ID attached to log" + log})
                            }
                            log.adName = ad.name;
                            return cb()
                            
                        })
                        .catch(function (err) {
                            cb(err)
                        })
                }, function (err) {
                    if (err)
                        return res.serverError({error: err})
                    else {
                        logs = _.groupBy(logs, 'adName')

                        //var end = new Date().getTime()
                        //sails.log.debug("Daily count time " + (end - start))
                        return res.ok(logs)
                    }
                });
                return null;
            })

            .catch(function (err) {
                return res.serverError({error: err})
            })
    },
    


    //it might be cool to sort by ad name by day but thats complex
    weeklyImpressions: function (req, res) { //takes hella long to query ugh
        var start = new Date().getTime()
        var logs = []
        var impressions = [0, 0, 0, 0, 0, 0, 0]
        async.each([6, 5, 4, 3, 2, 1, 0],
            function (num, cb) {
                var query = {
                    logType: 'impression',
                    loggedAt: {
                        '>': new Date(moment().subtract(num, 'days').startOf('day')),
                        '<': new Date(moment().subtract(num, 'days').endOf('day'))
                    }
                };


                //var start = new Date().getTime()

                return OGLog.find(query)
                    .then(function (logs) {
                        //var other = new Date().getTime()
                        //sails.log.debug("Query time = " + (other - start))
                        return Ad.find({creator: req.session.user.id}) //TODO this is bad
                            .then(function (ads) {

                                var ids = _.map(ads, 'id')
                                logs = _.filter(logs, function (l) {
                                    return (_.findIndex(ids, function (id) {
                                        return id == l.message.adId
                                    }) > -1)
                                })


                                impressions[6 - num] = logs.length;
                                //var end = new Date().getTime()
                                //sails.log.debug("inner inner Exec Time " + (end - other))

                                //sails.log.debug("inner Exec Time " + (end - start))
                                cb();
                                return null; 
                            })
                        
                    })
                    .catch(function(err){
                        cb(err)
                    })
            },
            function (err) {
                if (err)
                    return res.serverError({error: err})
                else {
                    var end = new Date().getTime()

                    //sails.log.debug("Exec Time " + (end - start))
                    
                    return res.ok(impressions)
                }


            }
        )


    },

    //TODO impressions for an ad given a certain time period
    timeSpanImpressions: function(req, res){
        var params = req.allParams();
        
        if (!params.id || !params.start || !params.end){
            return res.badRequest({error: "Missing params"})
        }
        
        Ad.findOne(params.id)
            .then(function(ad){
                if (!ad)
                    return res.notFound({error: "Bad ad ID "})
                var start = new Date(moment(params.start, "YYYY-MM-DD").startOf('day'))
                var end = new Date(moment(params.end, "YYYY-MM-DD").endOf('day'))

                if ((start - end) > 0)
                    return res.badRequest({error: "dates are not right"})
                var query = {
                    logType: 'impression',
                    loggedAt: {
                        '>': start,
                        '<': end
                    }
                }
                return OGLog.find(query)
                    .then(function(logs){
                        logs = _.filter(logs, {message: {adId: params.id}})
                        var grouped = _.groupBy(logs, function(log){
                            return moment(log.loggedAt).format("YYYY-MM-DD")
                        })
                        var counts = {}
                        _.times((moment(end).diff(moment(start), 'days')) +1, function(num){
                            var date = moment(start).add(num, 'days').format("YYYY-MM-DD")
                            counts[date] = grouped[date] ? grouped[date].length : 0
                        })

                        return res.ok(counts)
                    })

            })
            .catch(function(err){
                return res.serverError({error: err})
            })
        
    },
    
    
    //TODO 
    forDevice: function (req, res) {
        var params = req.allParams()

        if (!params.deviceId) {
            //deal with this
            return res.badRequest({error: "No device id"})
        }
        //TODO figure out criteria for ads to return

        Ad.find({reviewed: true, accepted: true, deleted: false})
            .then(function (ads) {
                return res.ok(ads)
            })
            .catch(function (err) {
                return res.serverError({error: err})
            })
    },

    forVenue: function (req, res) {

        if (req.method !== "GET")
            return res.badRequest({error: "Wrong verb; must be GET"});

        var params = req.allParams();

        if (!params.id)
            return res.badRequest({error: "No venue id provided"});

        return Venue.findOne(params.id)
            .then( function (venue) {
                if (!venue)
                    return res.notFound({error: "Venue with id " + params.id + " not found"});

                if (!venue.sponsorships)
                    return res.ok([]);

                return Ad.find(_.extend(AD_RUNNING, { id: venue.sponsorships}))
                    .then( res.ok );
            })
            .catch( res.serverError )
    }


};

