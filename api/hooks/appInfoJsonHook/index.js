
var Promise = require('bluebird');
var sails = require('sails');
var fs = Promise.promisifyAll(require('fs'));



module.exports = function appInfoJsonHook(sails) {

	var cronDelay = 1000 * 60 * 60; //1 hour
	var topFolderStructure = "./assets/blueline/opp/";

	var config;

	return {

		configure: function () {
			if (!sails.config.hooks.infoJsonSync || !sails.config.hooks.infoJsonSync.hookEnabled) {
				sails.log.warn("There's no config file for appInfoJsonSync or its hook is disabled... ");
			}

			config = sails.config.hooks.infoJsonSync;
		},

		initialize: function (cb) { 

			cronDelay = config.syncDelay;
			sails.log.debug('appInfo will sync in this time: ' + config.syncDelay / 1000 + 's');
			setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);

			return cb();
		},


		sync: async function () {
			sails.log.silly("RUNNING APP INFO JSON HOOK")
			fs.readdirAsync(topFolderStructure).then(function (folderArray) {
				

				for (var i = 0; i < folderArray.length; i++){
					fs.readFileAsync(topFolderStructure + folderArray[i] + "/info/info.json")
						.then(function (fileContents) { 
							try {
								sails.hooks.appinfojsonhook.process(JSON.parse(fileContents));
							} catch (error) {
								if (!error instanceof SyntaxError || !folderArray[i]) return;
								sails.hooks.appinfojsonhook.process({ 'appId': folderArray[i] });
							}
							}).catch(function (err) { 
							//File exists but cannot be read
							 sails.log.error(err);
						})
				}

			})
			
			
			.catch(function (err) {
				sails.log.silly("APP INFO JSON HOOK: " + err);
			});
			
			
			
			
			setTimeout(sails.hooks.appinfojsonhook.sync, config.syncDelay);
			
		},

		process: async function (localObj) {
			//TODO: Talk to mitch about proper way to do the next line
			var serverJson = await ProxyService.get('http://localhost:2001/app').then(function (d) { return d.body }).catch(function (err) { console.log(err); })
			var serverObj = _.find(serverJson, { 'appId': localObj.appId });

			// sails.log.silly("Local Obj:", localObj);
			// sails.log.silly("Server Obj: ", serverObj);

			if (!serverObj) //If we couldn't download anything from the server, we have to upload
				return;

			if (!localObj.updatedAt && serverObj.updatedAt) //If we passed only a appId name to localObj and serverObj has data, write the data
				sails.hooks.appinfojsonhook.writeJson(topFolderStructure + serverObj.appId + "/info/info.json", serverObj)


			if (localObj.updatedAt > serverObj.updatedAt)
			{
				//Write something to the server
			} else if (serverObj.updatedAt > localObj.updatedAt) { //Server data is newer than local data
				sails.hooks.appinfojsonhook.writeJson(topFolderStructure + serverObj.appId + "/info/info.json", serverObj)
			}

		},

		writeJson: function (path, data) {
			fs.writeFileAsync(path, JSON.stringify(data, null, 2), 'utf8');
		}

		
	}




}

