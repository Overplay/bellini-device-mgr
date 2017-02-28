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
    }

};