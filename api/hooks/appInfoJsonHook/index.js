var Promise = require('bluebird');
var sails = require('sails');
var fs = Promise.promisifyAll(require('fs'));
var glob = require('glob');




module.exports = function appInfoJsonHook(sails) {

	var topFolderStructure = "assets/blueline/opp/";

	var config;

	return {

		configure: function () {
			if (!sails.config.hooks.infoJsonSync || !sails.config.hooks.infoJsonSync.hookEnabled) {
				sails.log.warn("There's no config file for appInfoJsonSync or its hook is disabled... ");
			}

			config = sails.config.hooks.infoJsonSync || {
				hookEnabled: true,
				syncDelay: 1000 * 60 * 60
			};
		},

		initialize: function (cb) {
			//If hookEnabled == false don't do anything
			cronDelay = config.syncDelay;
			sails.log.debug('appInfo will sync in this time: ' + config.syncDelay / 1000 + 's');
			setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);

			return cb();
		},


		sync: function () {
			//sails.log.silly("RUNNING APP INFO JSON HOOK")


			// glob(topFolderStructure + "**/info.js", function (err, matches) {
			glob("./assets/blueline/**/info.json", function (err, matches) {

				for (var i = 0; i < matches.length; i++) {
					sails.hooks.appinfojsonhook.process(matches[i]);
				}

				if (!err)
					setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);
			});


			// fs.readdirAsync(topFolderStructure).then(function (folderArray) {

			// 	for (var i = 0; i < folderArray.length; i++) {
			// 		fs.readFileAsync(topFolderStructure + folderArray[i] + "/info/info.json")

			// 		.then(function (fileContents) {
			// 			try {
			// 				sails.hooks.appinfojsonhook.process(JSON.parse(fileContents));
			// 			} catch (error) {
			// 				if (!error instanceof SyntaxError || !folderArray[i]) return;
			// 				sails.hooks.appinfojsonhook.process({
			// 					'appId': folderArray[i]
			// 				});
			// 			}
			// 		}).catch(function (err) {
			// 			//File exists but cannot be read
			// 			sails.log.error(err);
			// 		})

			// 	}

			// })

			// .catch(function (err) {
			// 	sails.log.silly("APP INFO JSON HOOK: " + err);
			// });


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
									if (new Date(fileStats.mtime) < new Date(serverDbObj.updatedAt)) {
										return;
									}


									if (!serverDbObj) {
										if (infoJsonObj.appId)
											return App.create(infoJsonObj);
									} else {
										//If info.json is newer than the server data, update the server data.
										return App.update(serverDbObj.id, infoJsonObj).exec(function after(err, updated) {
											if (err) {
												sails.log.error(`Error updating, perhaps the info.json ${fileLocation} isn't the newest version?`)
												sails.log.error(err);
												return;
											}
											sails.log.info(updated[0].appId, 'updated in database.');
										})
									};
									// return App.destroy(app.id).then(function () {
									// 	return App.create(localObj);
									// })
								});
						}).catch(function (err) {
							sails.log.error(err);
						});
				})
		},

		writeJson: function (path, data) {
			fs.writeFileAsync(path, JSON.stringify(data, null, 2), 'utf8');
		}


	}




}