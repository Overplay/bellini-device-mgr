/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsAuth", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        return sailsApi.getModels( 'auth', queryString )
            .then( function ( auths ) {
                return auths.map( newAuth );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelAuthObject( json ) {

        CoreModel.call( this );

        this.modelType = 'auth'

        this.parseInbound = function ( json ) {
            this.user = json && json.user;
            this.email = json && json.email;
            this.blocked = json && json.blocked;

            this.parseCore( json );
        };

        this.getPostObj = function () {
            var fields = ['email', 'blocked', '@id:user'];
            return this.cloneUsingFields(fields);
        };

        this.parseInbound( json );

    }

    ModelAuthObject.prototype = Object.create( CoreModel.prototype );
    ModelAuthObject.prototype.constructor = ModelAuthObject;

    var newAuth = function ( params ) {
        return new ModelAuthObject( params );
    }

    var getAuth = function ( id ) {
        return sailsApi.getModel( 'auth', id )
            .then( newAuth );
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        new:    newAuth,
        get:    getAuth
    }

} );