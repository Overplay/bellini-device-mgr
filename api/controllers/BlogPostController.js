/**
 * BlogPostController
 *
 * @description :: Server-side logic for managing blogposts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


// MAK: For now, this is here just to test authorization

module.exports = {

    restricted: function ( req, res ) {
        return res.ok( "If You can see this you are authenticated" );
    },
    
    open:       function ( req, res ) {
        return res.ok( "This is open to all!!!" );
    },

    admin: function ( req, res ) {
        return res.ok( "This is open to admin!!!" );
    }
    
};

