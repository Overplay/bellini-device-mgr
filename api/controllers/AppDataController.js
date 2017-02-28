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
		
	}
	
};

