/*********************************

 File:       socialscraper.js
 Function:   Settings for the Social Scraper Hook
 Copyright:  Ourglass TV
 Date:       4/5/17 11:01 AM
 Author:     mkahn

 Enter detailed description

 **********************************/


module.exports.socialscraper = {

    cronSettings:   {
        hookEnabled: true,
        cronDelay:  1000 * 60 * 5 // 5 minutes
    },

    twitter: {
        CONSUMER_KEY: "ZKGjeMcDZT3BwyhAtCgYtvrb5",
        CONSUMER_SECRET: "iXnv6zwFfvHzZr0Y8pvnEJM9hPT0mYV1HquNCzbPrGb5aHUAtk"
    }

};