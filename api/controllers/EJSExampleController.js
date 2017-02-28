/**
 * EJSExampleController
 *
 * @description :: Shows the binding of Views and Policies thru a Controller without a Model
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


// MAK: For now, this is here just to test authorization

module.exports = {

    restricted: function ( req, res ) {
        return res.view( "ejs-example/ejs-authenticated", { myMessage: "Coming at you AUTHORIZED" } );
    },
    
    open:       function ( req, res ) {
        return res.view( "ejs-example/ejs-open", { myMessage: "Coming at you OPEN"} );
    },

    admin: function ( req, res ) {
        return res.view( "ejs-example/ejs-admin", { myMessage: "Coming at you ADMIN" } );
    }
    
};

