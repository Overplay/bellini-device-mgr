/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsApps", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/app', queryString )
            .then( function ( venues ) {
                return venues.map( newApp );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelAppObject( json ) {

        CoreModel.call( this );

        this.modelType = 'app';

        this.parseInbound = function ( json ) {
            this.appId = json && json.appId;
            this.displayName = json && json.displayName;
            this.icon = json && json.icon;
            this.defaultModel = json && json.defaultModel;
            this.appWidth = json && json.appWidth;
            this.appHeight = json && json.appHeight;
            this.appType = json && json.appType;
            this.patronControllable = json && json.patronControllable;
            this.releaseLevel = json && json.releaseLevel;
            this.isVirtual = json && json.isVirtual;
            this.description = json && json.description;

            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'appId', 'displayName', 'icon', 'defaultModel', 'appWidth', 'appHeight', 'appType',
                'patronControllable', 'releaseLevel', 'description', 'isVirtual' ];
            return this.cloneUsingFields( fields );

        };

    }

    ModelAppObject.prototype = Object.create( CoreModel.prototype );
    ModelAppObject.prototype.constructor = ModelAppObject;

    var newApp = function ( params ) {
        return new ModelAppObject( params );
    }

    var getApp = function ( id ) {

        if ( id === 'new' )
            return newApp( { appId: 'new.app' } );

        return sailsApi.getModel( 'app', id )
            .then( newApp );
    }

    // Not tested
    var getByAppId = function ( appId ) {
        return sailsApi.apiGet( '/venue?appId=' + appId )
            .then( function ( candidates ) {
                if ( candidates.length > 0 ) {
                    return newApp( candidates[ 0 ] );
                } else {
                    throw new Error( 'not found' );
                }
            } )
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:     getAll,
        new:        newApp,
        get:        getApp,
        getByAppId: getByAppId,
        selections: {
            releaseLevel: [ 'dev', 'alpha', 'beta', 'release' ]
        }
    }

} )