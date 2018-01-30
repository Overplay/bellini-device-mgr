/**
 * Created by cgrigsby on 8/17/16.
 */



module.exports.hooks = {

    deviceCleaner: {
        regCodeTimeout: 1000 * 60 * 60 * 24, //1 day , change to whatever
        hookEnabled: true,
        cleanDelay: 1000 * 60 * 60, // 1 hour
    },
    userCleaner: {
        hookEnabled: true,
        cleanDelay: 1000 * 60 * 60, //1 hour
    },
    // Syncs the appinfo from /assets/blueline/opp to the DB, but it seems broken in that it does not respect the file
    // date correctly.
    infoJsonSync: {
        hookEnabled: false,
        syncDelay: 1000 * 10 * 5 , //5 minutes
    },
    
    

};