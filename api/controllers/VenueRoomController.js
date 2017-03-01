/**
 * Created by mkahn on 3/1/17.
 */

module.exports = {

    join: function(req, res){

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method != 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.appid || !params.deviceUDID )
            return res.badRequest( { error: "Missing params" } );

    }

}