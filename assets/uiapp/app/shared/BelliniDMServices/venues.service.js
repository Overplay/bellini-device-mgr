/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "bVenues", function ( $http, wApi, wCoreModel, $log ) {


    var getAll = function ( queryString ) {
        return wApi.getModels( 'venue', queryString )
    }

    var CoreModel = wCoreModel.CoreModel;

    function ModelVenueObject( json ) {

        CoreModel.call( this );

        this.modelType = 'venue'

        this.parseInbound = function ( json ) {
            this.name = json && json.name || '';
            this.venueUUID = json && json.venueUUID;
            this.createdAt = json && json.createdAt;
            this.updatedAt = json && json.createdAt;
            this.id = json && json.id;
        }

        this.getPostObj = function () {
            // Not allowed to modify really anything. Should be done in BelliniCore
            return {
                name:       this.name
            }
        }

        this.parseInbound( json );

    }

    ModelVenueObject.prototype = Object.create( CoreModel.prototype );
    ModelVenueObject.prototype.constructor = ModelVenueObject;

    var newVenue = function ( params ) {
        return new ModelVenueObject( params );
    }

    var getVenue = function ( id ) {
        return wApi.getModel( 'venue', id )
            .then( newVenue );
    }
    
    // TODO Brittle?
    var getByUUID = function( uuid ){
        return wApi.getModels( 'venue', "uuid="+uuid)
            .then(function(varr){
                return newVenue(varr[0]);
            });
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        new:    newVenue,
        get:    getVenue,
        getByUUID: getByUUID
    }

} )