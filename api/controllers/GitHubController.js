/**
 * Created by mkahn on 3/1/17.
 */

module.exports = {

    push: function( req, res ){

        sails.log.debug("GitHub hook hit!");
        
        sails.log.debug(req.body);
        
        res.ok({"hook":"Yup"});
    }
}