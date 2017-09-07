/**
 * OGDevice.js
 *
 * @description :: Registration info for every devices
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const _ = require('lodash');

module.exports = {

    attributes: {

        deviceUDID: {
            type:     'string',
            required: true,
            unique:   true
        },

        atVenueUUID: {
            type: 'string'
        },

        name: {
            type:       'string',
            defaultsTo: "No Name"
        },

        installedApps: {
            type:       'array',
            defaultsTo: []
        },

        runningApps: {
            type:       'array',
            defaultsTo: []
        },

        systemAppState: {
            type: 'json',
            defaultsTo: { crawler: {}, widget: {} }
        },

        accessToken: {
            type:       'string',
            defaultsTo: ''
        },

        hardware: {
            type:       'json',
            defaultsTo: {}
        },

        software: {
            type:       'json',
            defaultsTo: {}
        },

        data: {
            type:       'json',
            defaultsTo: {}
        },

        lastContact: {
            type: 'date'
        },

        guideInfo: {
            type:       'json',
            defaultsTo: {
                source:   'ogpgs',
                lineupId: "5266D",
                carrier:  "DirecTV"
            }
        },

        pairedTo: {
            type:       'json',
            defaultsTo: {}
        },

        currentProgram: {
            type:       'json',
            defaultsTo: {}
        },

        timeZoneOffset: {
            type:       'string',
            defaultsTo: '-0700'
        },

        favoriteChannels: {
            type:       'array',
            defaultsTo: []
        },

        hideChannels: {
            type:       'array',
            defaultsTo: []
        },

        tempRegCode: {
            type: 'string',
            defaultsTo: ''
        },

        /**
         * Make the OGDevice entry consistent with new app launch
         * @param appObj Application Object, NOT appId
         * @param slot
         */
        launchApp: function(appObj, slot){

            // first do the legacy runningApps entry
            const launchedAppType = appObj.appType;
            // Now we need to remove any such app from currently running
            _.remove( this.runningApps, function ( a ) {
                return a.appType === launchedAppType;
            } );
            this.runningApps.push( appObj );

            // OK, lets do the systemAppState thang
            this.systemAppState[appObj.appType] = { app: appObj, slot: slot || 0 };

        },

        killApp: function(appObj){

            // first do the legacy runningApps entry
            _.remove( this.runningApps, function ( a ) {
                return a.appId === appObj.appId;
            } );

            // Now system state
            this.systemAppState[appObj.appType] = {};

        },

        moveApp: function(appObj, slot){
            this.systemAppState[appObj.appType].slot = slot;
        }

    },

    afterUpdate: function(updatedRecord, cb){

        // If the reg code is set, put a timeout to clear it in 5 minutes
        if (updatedRecord.tempRegCode){
            setTimeout( function(){
                OGDevice.update({ deviceUDID: updatedRecord.deviceUDID }, { tempRegCode: ''})
                    .then(function(dev){
                        sails.log.silly("Cleared temp reg code");
                    })
            }, 5 * 60 * 1000);
        }

        cb();
    },

    beforeCreate: function(values, cb){

        values.lastContact= new Date();
        cb();
    }
};

