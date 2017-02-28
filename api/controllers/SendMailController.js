/**
 * Created by mkahn on 2/3/17.
 */


module.exports = {


    generic: function ( req, res ) {

        if ( req.method != 'PUT' ) {
            return res.badRequest( { error: "You canna do that thang"} );
        }
        
        var params = req.allParams();

        var body = params.emailbody;
        var apikey = params.apikey;
        var to = params.to;
        
        //TODO this is so WEAK
        if (!apikey){
            res.forbidden( { error: "No entrado, hombre" })
        }
        
        if (!body){
            return res.badRequest( { error: "You are missing something vital, mi amigo" } );
        }

        if ( !to ) {
            return res.badRequest( { error: "You want I should send everywhere?" } );
        }
        
        MailingService.genericEmail({ body: body, sendTo: to});
        
        return res.ok( { message: "gave it a shot!"} );
        
    }

};
