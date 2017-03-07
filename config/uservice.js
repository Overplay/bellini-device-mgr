/**
 * Created by mkahn on 2/24/17.
 */

/*
    Settings specific to setting up the OG microservice cloud.
 */

module.exports = {
    
    // Main port this service runs on
    port: process.env.PORT || 2001,

    // Where to get ads
    sponsorProxy: {
        endpoint: 'http://107.170.209.248',
        allAds: '/ad/getAccepted',
        adsForVenue: '/ad/forVenue/'
    }


}
