/**
 * Media.js
 *
 * @description :: Media v2
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var path = require('path');
var verror = require('verror');
var url = require('url');
var Promise = require("bluebird");
var _ = require("lodash");
var SkipperDisk = require('skipper-disk');
var util = require('util');
var fs = require('fs');
var mkdirp = require('mkdirp');
var mime = require('mime');
var superagent = require('superagent');


module.exports = {

    // Enforce model schema in the case of schemaless databases
    schema: true,

    attributes: {
        /**
         * These are all from ssexy Media
         */
        path: {
            type: 'string',
            required: true,
            notEmpty: true,
            protected: false, //SJM
            defaultsTo: ''
        },

        // TODO: we probably won't use this...
        flags: {
            type: 'json',
            defaultsTo: {"inappropriate": false, "favorite": false, "sticky": false}
        },

        file: {
            type: 'json',
            defaultsTo: {}
        },

        source: {
            type: 'string',
            defaultsTo: ''
        },

        metadata: {
            type: 'json',
            defaultsTo: {}
        },

        /*advertisement: { //TODO remove if we switch to an array of media IDs in Ad
            model: "Ad"
         },*/

        


        // Override toJSON instance method to remove path value. The path value
        // is an absolute filesystem path, something a hcaker could mke use of.

        toJSON: function () {

            var obj = this.toObject();

            //This var is set in config/env files
            if (sails.config.models.terse) {
                delete obj.path;
            }

            return obj;
        }

    },
    

    /**
     * This method sends an array (contrary to docs), so it need to walk every item in the array.
     */
    afterDestroy: function (deletedRecords, next) {

        sails.log.silly('Media afterDestroy ' + util.inspect(deletedRecords));

        function rmFile(record) {

            return new Promise(function (fulfill, reject) {


                var destinationFolder = require('path').resolve(sails.config.paths.media);

                if (!record.path) fulfill();

                // Make sure it's within our media path
                else if (!_.startsWith(record.path, destinationFolder)) {
                    fulfill();
                }

                else {
                    SkipperDisk().rm(record.path, function (err) {
                        if (err) reject(err);
                        else fulfill();
                    });
                }
            });
        }

        function rmAllFiles(records) {
            return Promise.all(records.map(rmFile));
        }

        rmAllFiles(deletedRecords).then(function (results) {
            return next();
        }, function (err) {
            return next(new verror(err, "destroy media path failed"));
        });
        

    }

};
