/**
 * AppDataController
 *
 * @description :: Server-side logic for managing Appdatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	getAllForApp: function(req, res){

	    if (req.method != 'GET')
	        return res.badRequest({"error":"bad verb"});

	    var params = req.allParams();
	    if (!params.appid){
            return res.badRequest({"error":"How about an app id, pal?"});
	    }
	    
	    AppData.find({ forAppId: params.appid})
            .then( function(models){
                return res.ok(models);
            })
            .catch( res.err )
		
	},
	
	// TAKES in appid, deviceid, venueid
	// GET appdata/:appid/:deviceid
	// GET appdata

	// get /appmodel/:appid/:deviceid

	getAppDataForDevice: function(req, res){

		var params = req.allParams();
		var appid = params.appid;
		var deviceid = params.deviceid;

		switch (req.method){

			case 'POST':
				sails.log.silly("POSTING app data for: "+appid+ ' on device '+deviceid);
				AppData.findOne({ forAppId: appid, forDeviceId: deviceid })
					.then(function(model){
						if (model){
							return res.badRequest({ error: "model already exists, try a PUT genius!"});
						}

						var newAppData = { forAppId: appid,
											forDeviceId: deviceid,
											data: params.data || {}
											};
						AppData.create(newAppData)
							.then(function(model){
								if (!model){
									return res.serverError({error:"could not make model"});
								}
								return res.ok(model);
							})
							.catch(res.serverError)

					})
					.catch(res.serverError);
				break;

			case 'PUT':
				sails.log.silly("PUTTING app data for: " + appid + " on device " + deviceid);

				var newAppData = { forAppID: appid, forDeviceId: deviceid, data: params.data || {} };
				AppData.update( { forAppId: appid, forDeviceId: deviceid }, newAppData )
					.then( function ( model ) {
						if ( !model ) {
							return res.serverError({error: "unable to update model"});
						}
						return res.ok( model );
					})
					.catch( res.serverError );

				break;

			default:
				return res.ok( "Not implemented" );

		}



	}
	
};

