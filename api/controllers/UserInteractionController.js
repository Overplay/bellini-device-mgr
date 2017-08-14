
module.exports = {


    log: function(req, res){

        var params = req.allParams();

        if (!params.userId){
            res.badRequest({ error: 'no userId param'});
        }

        if ( !params.logdata ) {
            res.badRequest( { error: 'no logdata param' } );
        }

        BCService.UserInteraction.log( params.userId, params.logdata )
            .then( res.ok )
            .catch( res.proxyError );

    },

    logMobile: function ( req, res ) {

        var params = req.allParams();

        if ( !params.userId ) {
            res.badRequest( { error: 'no userId param' } );
        }

        if ( !params.logdata ) {
            res.badRequest( { error: 'no logdata param' } );
        }

        BCService.UserInteraction.log( params.userId, params.logdata )
            .then( res.ok )
            .catch( res.proxyError );

    }

}