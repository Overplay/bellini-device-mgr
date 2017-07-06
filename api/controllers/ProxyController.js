
/*********************************

 File:       ProxyController.js
 Function:   For widgets to proxy out to other services easily. Like trivia APIs.
 Copyright:  Ourglass TV
 Date:       6/28/17 10:28 AM
 Author:     mkahn

 **********************************/


module.exports = {

    get: function(req, res){

        if (req.method !== 'GET' )
            return res.badRequest({ error: 'GET only'});

        if (!req.param('url'))
            return res.badRequest( { error: 'No url param.' } );


        ProxyService.get( req.param('url'))
            .then( function(resp){
                return res.ok(resp.body);
            })
            .catch( res.proxyError );

    }

}