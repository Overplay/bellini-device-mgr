/**
 * Created by mkahn on 2/24/17.
 */

var request = require( 'superagent-bluebird-promise' );
var Promise = require( "bluebird" );

module.exports = {

    
    login: function ( req, res ) {

        var params = req.allParams();
        
        request.post( 'http://localhost:2000/auth/login' )
            .send({ email: params.email, password: params.password, type: "local"})
            .then( function(d){
                req.session.authenticated = true;
                res.ok(d);
            } )
            .catch( res.badRequest )

    }

}