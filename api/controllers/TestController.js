/**
 * Created by mkahn on 8/11/17.
 */


module.exports = {

    // Should be protected by BC session policy
    session: function(req, res){
        BCService.UserInteraction.log( req.bcuser, 'TEST_SESSION')
            .then( res.ok )
            .catch( res.proxyError)
    }

}