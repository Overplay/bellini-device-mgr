/**
 * Created by mkahn on 2/6/17.
 */

app.factory( "wMedia", function ( $http, wApi, wCoreModel, $log ) {


    var getAll = function ( queryString ) {
        return wApi.getModels( 'media', queryString )
    }

    var CoreModel = wCoreModel.CoreModel;

    function ModelMediaObject( json ) {

        CoreModel.call( this );

        this.modelType = 'media';

        this.parseInbound = function ( json ) {
            this.path = json && json.path || '';
            this.flags = json && json.flags;
            this.createdAt = json && json.createdAt;
            this.updatedAt = json && json.updatedAt;
            this.id = json && json.id;
        }

        this.getPostObj = function () {
            return {
                flags: this.flags
            }
        }

        this.parseInbound( json );

        this.flagInappropriate = function ( flag ) {
            this.flags.inappropriate = !!flag;
        }
        
        this.imageUrl = function(){
            return 'media/download/'+this.id;
        }
    }

    ModelMediaObject.prototype = Object.create( CoreModel.prototype );
    ModelMediaObject.prototype.constructor = ModelMediaObject;

    var newMedia = function ( params ) {
        return new ModelMediaObject( params );
    };

    var getMedia = function ( id ) {
        return wApi.getModel( 'media', id )
            .then( newMedia );
    };

    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        get: getMedia,
        new: newMedia
    }
});


