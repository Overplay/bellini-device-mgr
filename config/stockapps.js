/**
 * Created by mkahn on 3/1/17.
 */

//Note: test data will be duplicated if being run on a cluster! 
var moment = require('moment')
var Promise = require('bluebird');

var stockApps = [
    {
        appId:        "io.ourglass.ogcontrol",
        defaultModel: { favoriteChannels: [] },
        appType:      'mobile',
        appWidth:     10,
        appHeight:    50
        },
    {
        appId:        "io.ourglass.nowserving",
        displayName:  "Now Serving",
        icon: "nowserve.png",
        defaultModel: { ticketNumber: 0 },
        appType: 'widget',
        appWidth: 10,
        appHeight: 35,
        patronControllable: false
    },
    {
        appId:        "io.ourglass.ogcrawler",
        displayName:  "Crawler",
        icon: "space.png",
        defaultModel: {
            "messages":       [ "Ourglass TV", "Check Ourglass out at www.ourglass.tv" ],
            "twitterQueries": [ "@Warriors" ],
            "hideTVTweets":   false
        },
        appType:   'crawler',
        appWidth:  100,
        appHeight: 9,  // 97 in 1080, 64 in 720
        patronControllable: false
    },
    {
        appId:              "io.ourglass.ogmeetus",
        displayName:        "Meet the OGs",
        icon:               "space.png",
        defaultModel:       {
            "challenges":       [ { q: 'Q1: Find an OG who has wrestled Jimmy Kimmel on national TV', a: 'Mitch'},
                                 { q: 'Q2: This OG grew up in NJ, but went to college in CA', a: 'Kristin'},
                { q: 'Q3: Ourglass is based in this California city', a:'Campbell'},
                { q: 'Q4: How much does OurglassTV cost to install?', a:'0'},
                { q: 'Q5: Which OG ran rides at a major amusement park?', a: 'Treb' },
                { q: 'Q6: Which OG just got back from sunny Mexico?', a: 'Kristin' },

             ],
            "twitterQueries": [ "@OurglassTV" ],
            "hideTVTweets":   false,
            "scores":         {}
        },
        appType:            'crawler',
        appWidth:           100,
        appHeight:          9,  // 97 in 1080, 64 in 720
        patronControllable: false
    },
    {
        appId:              "io.ourglass.foodbliminal",
        displayName:        "Foodbliminal!",
        icon:               "space.png",
        defaultModel:       {},
        appType:            'crawler',
        appWidth:           100,
        appHeight:          20,
        patronControllable: false
    },
    {
        appId:        "io.ourglass.waitinglist",
        displayName: "Waiting List",
        icon: "waitlist@3x.png",
        defaultModel: {
            "parties": []
        },
        appType:     'widget',
        appWidth:     10,
        appHeight:    50,
        patronControllable: true
    },
    // {
    //     appId:        "io.ourglass.bltest",
    //     displayName:  "BlueLine Test",
    //     icon: "testapp.png",
    //     defaultModel: {
    //         mydata: [{ song: "My Milkshake" }, { song: "Mr. Roboto "}]
    //     },
    //     appType:   'widget',
    //     appWidth:  10,
    //     appHeight: 50
    // },
    // {
    //     appId:        "io.ourglass.mktest",
    //     displayName: "MK Test",
    //     icon:        "testapp.png",
    //     defaultModel: {
    //         mydata: { value: 0, setBy: "sails" }
    //     },
    //     appType:   'widget',
    //     appWidth:  10,
    //     appHeight: 50
    // },
    {
        appId:        "io.ourglass.shuffleboard",
        displayName: "Shuffleboard",
        icon:        "shuffleboard@3x.png",
        defaultModel: {
           red: 0, blue: 0
        },
        appType:   'widget',
        appWidth:  10,
        appHeight: 50,
        patronControllable: true
    },
    {
        appId:        "tuner",
        appType:      'virtual',
        isVirtual:     true
    }];

var self = module.exports.stockapps = {

    installStockApps: false,
    eraseOldApps: false,

    install: function () {

        if ( !self.installStockApps ) {
            sails.log.debug( "Skipping stock app installation." );
            return;
        }

        var chain = Promise.resolve();

        if ( self.eraseOldApps ) {
            sails.log.debug( "Erasing old stock app installation." );

            var destruct = [
                App.destroy( {} )
            ];

            chain = chain.then( function () {
                return Promise.all( destruct )
                    .then( function () {
                        sails.log.debug( "All app related entries destroyed." );
                    } );
            } )
        }

        return chain.then( function () {
            return Promise.map( stockApps, function ( app ) {
                return App.findOrCreate( app );
            } )
        } )

    }
};
