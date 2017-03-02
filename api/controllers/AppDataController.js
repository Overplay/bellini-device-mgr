/**
 * AppDataController
 *
 * @description :: Server-side logic for managing Appdatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function hasUDIDandAppId(req){

    var params = req.allParams();
    if ( !params.deviceUDID || !params.appid )
        return undefined;
        
    return params;

}

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
	// http://localhost:2001/appmodel/:erik/:12345?

	appDataForDevice: function(req, res){

		var params = req.allParams();
		var appid = params.appid;
		var deviceid = params.deviceid;

		switch (req.method){

			case 'POST':
				sails.log.silly("POSTING app data for: " + appid + ' on device ' + deviceid);
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
				AppData.findOne({ forAppId: appid, forDeviceId: deviceid })
					.then(function ( model ) {
						if ( !model ){
							return res.badRequest({ error: "model does not exist, try a POST"});
						}

						AppData.update( { forAppId: appid, forDeviceId: deviceid }, newAppData )
							.then( function ( model ) {
								if ( !model ) {
									return res.serverError({error: "unable to update model"});
								}
								return res.ok( model );
							})
							.catch( res.serverError );
					})
					.catch(res.serverError);

				break;

            case 'GET':
                sails.log.silly("GETTING app data for: " + appid + " on device " + deviceid);

                AppData.findOne({ forAppId: appid, forDeviceId: deviceid })
                    .then( function( model ) {
                        if ( !model ) {
                            return res.badRequest({error: "model does not exist!"});
                        }
                        return res.ok( model )
                    })
                    .catch(res.serverError);

                break;

			default:
				return res.ok( "Not implemented" );

		}

		
	},
	
	
	// Returns appdata for app for device, or creates and entry from the prototype in the App entry
	// TODO: Add precondition to make sure Device is in DB
	initialize: function(req, res){
	
	    if (req.method!='POST')
	        return res.badRequest({error:"bad verb"});
	        
        var params = hasUDIDandAppId(req);
        if (!params)
            return res.badRequest( { error: "missing udid or appid" } );
	
	    AppData.findOne({ forDeviceUDID: params.deviceUDID, forAppId: params.appid })
            .then( function(model){
                if (model)
                    return res.ok(model);
                    
                App.findOne({ appId: params.appid })
                    .then(function(app){
                        if (!app)
                            return res.badRequest({error:"no such app"});
                        AppData.create({ forAppId: params.appid, forDeviceUDID: params.deviceUDID, data: app.defaultModel })
                            .then(res.ok)
                            .catch(res.serverError);
                    })
                    .catch( res.serverError );
            })
            .catch(res.serverError);
	
	},
	
	// WEBSOCKETS subscription method. Must be called over sockets
	subscribe: function(req, res){

		if ( !req.isSocket ) {
			return res.badRequest({error: "Sockets only, sonny"});
		}

		if (req.method!='POST')
			return res.badRequest({ error: "That's not how to subscribe, sparky!"});
			
		//OK, we need a deviceUDID
		var params = req.allParams();

		if (!params.appid || !params.deviceUDID )
			return res.badRequest({ error: "Missing params"});

		AppData.findOne({ forDeviceUDID: params.deviceUDID, forAppId: params.appid })
			.then( function(model){

				if (!model)
				    return res.badRequest({error: "No such model"});

                AppData.subscribe(req, model.id);
                return res.ok(model)

			})
            .catch(res.serverError);

	}
	
};

