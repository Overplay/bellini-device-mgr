/**
 * Created by mkahn on 3/1/17.
 */

module.exports = {

    push: function( req, res ){

        //It's a test!
        sails.log.debug("GitHub hook hit!");
        
        sails.log.debug(req.body);

        GitHubService.updateFromOrigin();
        
        res.ok({"hook":"Yup"});
    }
}