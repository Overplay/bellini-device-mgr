/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var verror = require('verror');

module.exports =  {

    serve:  function( req, res ){

        var appId = req.allParams().appId || req.allParams().appid;

        if ( !appId ){
            return res.badRequest({ error: 'missing app parameter' });
        }

        var SkipperDisk = require( 'skipper-disk' );
        var fileAdapter = SkipperDisk( /* optional opts */ );

        var appPath = '/blueline/opp/'+appId+'/app/tv/index.html';

        return res.redirect(appPath);

        // Stream the file down
        // fileAdapter.read( appPath )
        //     .on( 'error', function ( err ) {
        //
        //         var err1 = new verror( err, "Download media `%s` read failed", mediaId );
        //         err1.status = 500;
        //         err1.propertyName = "path";
        //         err1.propertyValue = appPath;
        //         return res.negotiate( err1 );
        //     } )
        //     .pipe( res );


    }


	
};

