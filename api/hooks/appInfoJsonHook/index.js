var Promise = require('bluebird');
var sails = require('sails');
var fs = Promise.promisifyAll(require('fs'));
var glob = require('glob');

module.exports = function appInfoJsonHook(sails) {

	var config;

	return {

		configure: function () {
			if (!sails.config.hooks.infoJsonSync || !sails.config.hooks.infoJsonSync.hookEnabled) {
				sails.log.warn("There's no config file for appInfoJsonSync or its hook is disabled... ");
			}

			config = sails.config.hooks.infoJsonSync || {
				hookEnabled: true,
				syncDelay: 1000 * 60 * 5 //defaults to 5 minutes
			};
		},

		initialize: function (cb) {
			if (!config.hookEnabled)
				return cb();

			sails.log.debug('info.json(s) will sync every ' + config.syncDelay / 1000 + ' seconds.');
			setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);

			return cb();
		},


		sync: function () {
			//sails.log.silly("RUNNING APP INFO JSON HOOK")

			glob("./assets/blueline/**/info.json", function (err, matches) {

				for (var i = 0; i < matches.length; i++) {
					sails.hooks.appinfojsonhook.process(matches[i]);
				}

				if (!err)
					setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);
			});
		},

		process: function (fileLocation) {
			//TODO: Talk to mitch about proper way to do the next line
			fs.readFileAsync(fileLocation)
				.then(function (infoJsonObj) {
					infoJsonObj = JSON.parse(infoJsonObj);

					App.findOne({
						appId: infoJsonObj.appId
					})
						.then(function (serverDbObj) {

							fs.statAsync(fileLocation)
								.then(function (fileStats) {
									if (serverDbObj && (new Date(fileStats.mtime) < new Date(serverDbObj.updatedAt))) {
										return;
									}
									//If info.json is newer than the server data, update the server data.

									if (!serverDbObj) { //If it is only local, add it to the database
										if (infoJsonObj.appId) {
											return App.create(infoJsonObj).then(function (added) {
												sails.log.info(added[0].appId, 'added to database.');
											}).catch(function (err) {
												sails.log.error(`Bad info.JSON for app ${infoJsonObj.appId}.`);
											});
										}
									} else { //Otherwise it needs to be updated
										return App.update(serverDbObj.id, infoJsonObj).then(function after(updated) {
											sails.log.info(updated[0].appId, 'updated in database.');
										}).catch(function (err) { 
											`Bad info.JSON for app ${infoJsonObj.appId || serverDbObj.appId}.`;
										});
									}
									// return App.destroy(app.id).then(function () {
									// 	return App.create(localObj);
									// })
								});
						}).catch(function (err) {
							sails.log.error(err);
						});
				});
		},
		writeJson: function (path, data) {
			fs.writeFileAsync(path, JSON.stringify(data, null, 2), 'utf8');
		}
	};
};