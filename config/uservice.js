/**
 * Created by mkahn on 2/24/17.
 */

/*
 Settings specific to setting up the OG microservice cloud.
 */

module.exports = {

    // Main port this service runs on. Note this is NOT inside the uservice object!!
    port: process.env.PORT || 2001,

    uservice: {
        // Where to get ads
        sponsorProxy: {
            endpoint:    'http://107.170.209.248',
            allAds:      '/ad/getAccepted',
            adsForVenue: '/ad/forVenue/'
        },

        belliniCore: {
            url: 'http://138.68.230.239:2000'
        },

        bcSyncSettings: {
            cronDelay: 5 * 60 * 50 * 1000, // 5 min
            bcport:    2000
        }

    }


}
