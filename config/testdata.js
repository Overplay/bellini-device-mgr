/**
 * Created by rhartzell on 5/6/16.
 */

//Note: test data will be duplicated if being run on a cluster! 
var moment = require('moment')
var Promise = require('bluebird');
var adName = 'Advertisement One!';
var adDate = 'September 7'; //TODO
var self = module.exports.testdata = {

    installTestData: false,
    eraseOldData: false,

    install: function () {

        if (!self.installTestData) {
            sails.log.debug("Skipping test data installation.");
            return;
        }

        var chain = Promise.resolve();

        if (self.eraseOldData) {
            sails.log.debug("Erasing old test data installation.");

            var destruct = [
                Auth.destroy({}),
                User.destroy({}),
                Venue.destroy({}),
                Device.destroy({}),
                Media.destroy({}),
                Ad.destroy({}),
                OGLog.destroy({})
            ];

            chain = chain.then(function () {
                return Promise.all(destruct)
                    .then(function () {
                        sails.log.debug("All test models destroyed.");
                    });
            })
        }
        self.organizations.forEach(function (o) {
            chain = chain.then(function () {
                return Organization.findOne(o)
                    .then(function (org) {
                        if (org) {
                            reject(new Error("Organization exists, skipping creation"))
                        }
                        else {
                            return Organization.create(o)
                                .then(function (o) {
                                    sails.log.debug("Organization created")
                                })
                                .catch(function (err) {
                                    sails.log.debug("Organization Error Caught" + err)
                                })
                        }
                    })
                    .catch(function (err) {
                        sails.log.debug(err);
                    })
            })

        });

        self.users.forEach(function (u) {
            var email = u.email;
            var password = u.password;
            delete u.email;
            delete u.password;
            // find role IDs
            u.roles = [];
            u.roleNames.forEach(function (role) {
                u.roles.push(RoleCacheService.roleByName(role.role, role.subRole));
            });
            delete u.roleNames;
            if (u.organizationEmail) {
                var organizationEmail = u.organizationEmail;
                chain = chain.then(function () {
                    return Organization.findOne({email: organizationEmail})
                        .then(function (o) {
                            u.organization = o;
                        })
                })
                delete u.organizationEmail;
            }
            chain = chain.then(function () {
                return Auth.findOne({email: email})
                    .then(function (a) {
                        if (a) {
                            sails.log.debug("User exists");
                            return new Error("user already in system")
                        }
                        else {
                            return AdminService.addUser(email, password, u)
                                .then(function () {
                                    sails.log.debug("Created user " + email)
                                })
                                .catch(function (err) {
                                    sails.log.debug("error caught: " + err)
                                })
                        }

                    })

            })
        });

        self.advertisements.forEach(function (a) {
            var creatorEmail = a.creatorEmail;
            delete a.creatorEmail;

            chain = chain.then(function () {
                return Auth.findOne({email: creatorEmail})
                    .then(function (u) {
                        a.creator = u.user;
                        return Ad.findOne(a)
                            .then(function (ad) {
                                if (ad) {
                                    sails.log.debug("Ad exists")
                                    return new Error("Ad already in system")
                                }
                                else {
                                    a.advert = {type: '2g3s', media: {crawler: '', widget: ''}, text: ['', '', '']}
                                    return Ad.create(a)
                                        .then(function () {
                                            sails.log.debug("Ad created for " + creatorEmail);
                                        })
                                        .catch(function (err) {
                                            sails.log.debug(err)
                                        })
                                }
                            })

                    })
                    .catch(function (err) {
                        sails.log.debug(err)
                    })
            })


        });


        self.venues.forEach(function (v) {

            var ownerEmails = v.ownerEmails;
            var managerEmails = v.managerEmails;
            delete v.ownerEmails;
            delete v.managerEmails;
            var venueOwners = [];
            var venueManagers = [];

            if (v.organizationEmail) {
                var organizationEmail = v.organizationEmail;
                chain = chain.then(function () {
                    return Organization.findOne({email: organizationEmail})
                        .then(function (o) {
                            v.organization = o;
                        })
                })
                delete v.organizationEmail;
            }

            managerEmails.forEach(function (manager) {
                chain = chain.then(function () {
                    return Auth.findOne({email: manager})
                        .then(function (user) {
                            venueManagers.push(user.user);
                        })
                })
            })

            ownerEmails.forEach(function (owner) {
                chain = chain.then(function () {
                    return Auth.findOne({email: owner})
                        .then(function (user) {
                            venueOwners.push(user.user);
                        })
                })
            })

            // chain = chain.then(function () {
            //     return Auth.findOne({email: ownerEmails[0]}) //dumb fix
            chain = chain.then(function (user) {
                //v.venueOwners.push(user.user);
                //sails.log.debug(venueManagers)
                return Venue.findOne({name: v.name}) //this will work but venues could be double named (not unique)
                    .then(function (ven) {
                        //sails.log.debug(ven);
                        if (ven) {
                            sails.log.debug("Venue exists")
                            return new Error("Venue Exists, skipping creation")
                        }
                        else {
                            return Venue.create(v)

                                .then(function (newV) {
                                    //sails.log(newV)
                                    //sails.log(venueManagers)
                                    //sails.log(venueOwners)
                                    newV.venueOwners.add(venueOwners)
                                    newV.save({populate: false}, function (err) {
                                        if (err) sails.log.debug(err)
                                    });
                                    newV.venueManagers.add(venueManagers)
                                    newV.save({populate: false}, function (err) {
                                        if (err) sails.log.debug(err)
                                    });

                                    sails.log.debug("Venue created with name " + newV.name);
                                })
                                .catch(function (err) {
                                    sails.log.debug(err)
                                })
                        }

                    })
                    .catch(function (err) {
                        sails.log.debug(err)
                    })

            })
            // })

        });

        chain = chain.then(function () {
            return User.find()
                .populate('ownedVenues')
                .then(function () {
                    sails.log.debug("Owned Venues populated");
                })
        });

        chain = chain.then(function () {
            return User.find()
                .populate('managedVenues')
                .then(function () {
                    sails.log.debug("Managed Venues populated");
                })
        });

        self.devices.forEach(function (d) {
            var venueName = d.venueName; //be careful there can be multiple venues with the same name....
            delete d.venueName;
            var device;

            chain = chain.then(function () {
                return Venue.findOne({name: venueName}) //venues can have the same name!
                    .then(function (venue) {
                        d.venue = venue;
                        //sails.log.debug(d)
                        return Device.findOne({name: d.name, venue: venue.id}) //TODO use venue id and user id
                            .then(function (dev) {
                                //sails.log.debug(dev)

                                if (dev) {
                                    device = dev;
                                    return new Error("Device Exists, skipping creation")
                                }
                                else {
                                    return Device.create(d)
                                        .then(function (newDev) {
                                            device = newDev;
                                            sails.log.debug("Device created at location: " + d.locationWithinVenue);
                                        })
                                        .catch(function (err) {
                                            sails.log.debug(err)
                                        })
                                }

                            })
                            .catch(function (err) {
                                sails.log.debug(err)
                            })

                    })
            })
        });

        chain = chain.then(function () {
            return Venue.find()
                .populate('devices')
                .then(function () {
                    sails.log.debug("Venues' devices populated");
                })
        });

        self.logs.forEach(function (log) {
            var device = log.device;
            delete log.device;

            chain = chain.then(function () {
                return Venue.findOne({name: device.venue})
                    .populate('devices')
                    .then(function (v) {
                        log.deviceUniqueId = _.find(v.devices, function (o) {
                            return o.name === device.name
                        }).id
                    })
                    .then(function () {
                        if (log.message.adName) {
                            //add the time and the adId
                            return Ad.findOne({name: log.message.adName})
                                .then(function (ad) {
                                    delete log.message.adName;
                                    log.message.adId = ad.id;
                                })
                        }
                        else {
                            return;
                        }

                    })
                    .then(function () {
                        return OGLog.create(log)
                            .then(function () {
                                sails.log.debug("Log created");
                            })

                    })
                    .catch(function (err) {
                        sails.log.debug(err);
                    })
            })
        })

        chain = chain.then(function () {
            //sails.config.testdata.generateLogs();
            
        })

    },
    generateLogs: function () {
        sails.log.debug("generating hahahahaha fuck")
        var logs = []
        Device.find()
            .then(function (devices) {
                return Ad.find()
                    .then(function (ads) {
                        async.each(ads,
                            function (ad, cb) {
                                sails.log.debug(ad.name)
                                var log = {
                                    logType: 'impression',
                                    message: {
                                        adId: ad.id
                                    }
                                }
                                var times = _.random(100)
                                var chain = Promise.resolve()
                                _.times(times, function () {
                                    //generate log with random device
                                    log.deviceUniqueId = devices[_.random(devices.length -1)].id
                                    log.loggedAt = new Date(moment().hours(_.random(23))).toISOString()//.add(1, 'days')) //TODO randomize hours
                                    //sails.log.debug(log.loggedAt)
                                    OGLog.create(log).then(function(l){})
                                })
                                cb();
                            },
                            function (err) {
                                if (err)
                                    sails.log.debug("fuck", err)
                                else{
                                    sails.log.debug("Done")
                                    //OGLog.create(logs).then(function(l){sails.log.debug(l)})
                                }
                            })
                    })
            })
            .catch(function (err) {
                sails.log.debug(err)
            })

        //setTimeout(sails.config.testdata.generateLogs, 10000000);

    },
    users: [
        {
            firstName: 'Johnny',
            lastName: 'McAdmin',
            email: 'admin@test.com',
            password: 'beerchugs',
            roleNames: [{role: "admin", subRole: ""}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Ryan',
            lastName: 'Smith',
            email: 'ryan@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Vid',
            lastName: 'Baum',
            email: 'vid@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Silvanus',
            lastName: 'Conner',
            email: 'silvanus@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Kajetan',
            lastName: 'McNeil',
            email: 'kajetan@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'John',
            lastName: 'Alfredson',
            email: 'john@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Antonina',
            lastName: 'Burton',
            email: 'antonina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Caterina',
            lastName: 'Cvetkov',
            email: 'caterina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Joe',
            lastName: 'Rogers',
            email: 'joe@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Jerref',
            lastName: 'Gardiner',
            email: 'jerref@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}],
            organizationEmail: "dr@test.com"
        },
        {
            firstName: 'Carina',
            lastName: 'Fay',
            email: 'carina@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Nereus',
            lastName: 'Macar',
            email: 'nereus@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Abel',
            lastName: 'Filipovic',
            email: 'abel@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Patricia',
            lastName: 'Jarrett',
            email: 'patricia@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Unice',
            lastName: 'Ashley',
            email: 'unice@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Paulene',
            lastName: 'Vogel',
            email: 'vogel@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}]
        },
        {
            firstName: 'Sloane',
            lastName: 'Irwin',
            email: 'sloane@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Lon',
            lastName: 'Plaskett',
            email: 'lon@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Annegret',
            lastName: 'Henderson',
            email: 'annegret@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "manager"}, {role: "user", subRole: ""}]

        },
        {
            firstName: 'Henderson',
            lastName: 'Reed',
            email: 'hend@test.com',
            password: 'pa$$word',
            roleNames: [{role: "user", subRole: ""}]
        },
        {
            firstName: 'Elizabeth',
            lastName: 'Salas',
            email: 'elizabeth@test.com',
            password: 'pa$$word',
            roleNames: [{role: "proprietor", subRole: "owner"}, {role: "user", subRole: ""}, {role: "sponsor", subRole: ""}],
            organizationEmail: "dr@test.com"
        },
        {
            firstName: 'Advertiser',
            lastName: 'Smith',
            email: 'ad@test.com',
            password: 'pa$$word',
            roleNames: [{role: "sponsor", subRole: ""}, {role: "user", subRole: ""}]
        }
    ],
    venues: [
        {
            name: "Blue Line Pizza",
            address: {street: "415 E Campbell Ave", city: "Campbell", state: "CA", zip: "95008"},
            ownerEmails: ["john@test.com"],
            managerEmails: ["silvanus@test.com", "jerref@test.com"]
        },
        {
            name: "Ajito",
            address: {street: "7335 Bollinger Rd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmails: ["john@test.com"],
            managerEmails: ["silvanus@test.com", "unice@test.com"]
        },
        {
            name: "The Sink",
            address: {street: "1165 13th St.", city: "Boulder", state: "CO", zip: "80302"},
            ownerEmails: ["vogel@test.com"],
            managerEmails: ["annegret@test.com", "caterina@test.com"]
        },
        {
            name: "B Bar & Grill",
            address: {street: "40 E 4th St", city: "New York", state: "NY", zip: "10003"},
            ownerEmails: ["ryan@test.com"],
            managerEmails: ["unice@test.com", "jerref@test.com"]
        },
        {
            name: "Novo",
            address: {street: "726 Higuera St", city: "San Luis Obispo", state: "CA", zip: "93401"},
            ownerEmails: ["elizabeth@test.com"],
            organizationEmail: "dr@test.com",
            managerEmails: ["caterina@test.com", "annegret@test.com", "silvanus@test.com"]
        },
        {
            name: "Not Your Average Joe's",
            address: {street: "305 Main St", city: "Acton", state: "MA", zip: "01720"},
            ownerEmails: ["elizabeth@test.com"],
            organizationEmail: "dr@test.com",
            managerEmails: ["jerref@test.com", "silvanus@test.com"]
        },
        {
            name: "Islands",
            address: {street: "20750 Stevens Creek Blvd", city: "Cupertino", state: "CA", zip: "95014"},
            ownerEmails: ["carina@test.com"],
            managerEmails: ["annegret@test.com", "silvanus@test.com"]
        }
    ],
    devices: [
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Blue Line Pizza"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "The Sink"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "B Bar & Grill"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Not Your Average Joe's"
        },
        {
            name: "Bar Box",
            locationWithinVenue: "bar",
            venueName: "Islands"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Blue Line Pizza"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "The Sink"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "B Bar & Grill"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Not Your Average Joe's"
        },
        {
            name: "Entrance Box",
            locationWithinVenue: "entrance",
            venueName: "Islands"
        }

    ],
    organizations: [
        {
            name: "Delicious Restaurants",
            email: "dr@test.com",
            websiteUrl: "www.dr.com",
            address: {street: "204 California Blvd.", city: "San Luis Obispo", state: "CA", zip: "93405"},
            phone: 1234567890

        }
    ],

    advertisements: [
        {
            name: "Advertisement One!",
            creatorEmail: "ad@test.com",
            description: "an ad"
        },
        {
            name: "Advertisement Two!",
            creatorEmail: "ad@test.com",
            description: "anotha one"
        }
        ,
        {
            name: "Advertisement Three!",
            creatorEmail: "elizabeth@test.com",
            description: "noooooo"
        }
    ],

    logs: [
        {
            logType: "heartbeat",
            message: {
                uptime: "32:15:08",
                softwareVersions: {
                    amstelBright: "1.0.0",
                    aqui: "1.0.0",
                    android: "MMB29M"
                },
                installedApps: []
            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date().toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 12:13:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 12:20:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 11:30:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 11:37:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 21:40:00").toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 22:13:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 21:20:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 19:30:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 18:37:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 13:40:00").toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 16:13:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 16:20:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 16:30:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 21:37:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 21:40:00").toISOString()
        },

        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 22:13:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 20:20:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 18:30:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 17:37:00").toISOString()
        }
        ,
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "Not Your Average Joe's"
            },
            loggedAt: new Date(adDate + ", 2016 17:40:00").toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 13:13:00").toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 1:13:00").toISOString()
        },
        {
            logType: "impression",
            message: {
                adName: adName,

            },
            device: {
                name: "Bar Box",
                venue: "B Bar & Grill"
            },
            loggedAt: new Date(adDate + ", 2016 0:13:00").toISOString()
        }

    ]
};
