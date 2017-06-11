/**
 * Created by mkahn on 6/10/17.
 */

var Promise = require('bluebird');
var BYPASS = true;

module.exports = {

    chooseEndpoint: function( req, res ){

        var params = req.allParams();

        if (BYPASS){

            var base = "/blueline/opp/" + params.appId +
                '/app/control/index.html?deviceUDID=' + params.deviceUDID + '&displayName=' + 'FIXME';

            return res.redirect( base );

        }

        if (!params.appId){
            return res.badRequest({ error: 'no appid'});
        }

        if ( !params.deviceUDID ) {
            return res.badRequest( { error: 'no deviceUDID' } );
        }

        var preconditions = {
            app:    App.findOne( { appId: params.appId } ),
            device: OGDevice.findOne( { deviceUDID: params.deviceUDID } )
        }

        Promise.props(preconditions)
            .then( function(pre){
                var base = "/blueline/opp/" + params.appId +
                    '/app/control/index.html?deviceUDID=' + params.deviceUDID + '&displayName=' + 'FIXME';

                return res.redirect( base );
            })
            .catch(res.serverError);


    }

}