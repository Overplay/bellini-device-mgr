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
            endpoint:    'http://localhost:2000',
            allAds:      '/ad/getAccepted',
            adsForVenue: '/ad/forvenue/'
        },

        belliniCore: {
            url: 'http://localhost:2000'
        },

        bcSyncSettings: {
            cronDelay: 5 * 60 * 50 * 1000, // 5 min
            bcport:    2000
        },

        belliniPGS: {
            url: 'http://localhost:2020'
        }

    },

    security: {
        // This should be commented out for production. Bypasses JWT check and only looks for the signature below.
        magicJwt: 'Bearer of_good_tidings'
        }


}
