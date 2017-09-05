/**
 * Created by alexawestlake on 7/31/17.
 */


app.factory( "sailsOGAndroidRelease", function ( sailsApi, sailsCoreModel ) {

    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/ogandroidrelease', queryString )
            .then( function ( releases ) {
                return releases.map( newRelease );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelReleaseObject( json ) {

        CoreModel.call( this );

        this.modelType = 'ogandroidrelease';

        this.parseInbound = function ( json ) {
            this.majorRev = json && json.majorRev;
            this.minorRev = json && json.minorRev;
            this.versionCode = json && json.versionCode;
            this.filename = json && json.filename;
            this.releaseLevel = json && json.releaseLevel;

            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'majorRev', 'minorRev', 'versionCode', 'filename', 'releaseLevel'];
            return this.cloneUsingFields( fields );

        };

    }

    ModelReleaseObject.prototype = Object.create( CoreModel.prototype );
    ModelReleaseObject.prototype.constructor = ModelReleaseObject;

    var newRelease = function ( params ) {
        return new ModelReleaseObject( params );
    };

    var get = function ( id ) {
        if ( id === 'new' )
            return newRelease();
        return sailsApi.getModel( 'ogandroidrelease', id )
            .then( newRelease );
    };


    // Exports...new pattern to prevent this/that crap
    return {
        getAll:     getAll,
        new:        newRelease,
        get:        get,
        selections: {
            releaseLevel: [ 'archive', 'alpha', 'beta', 'release' ]
        }
    }

} );