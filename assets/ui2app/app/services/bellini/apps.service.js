/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsApps", function ( sailsApi, sailsCoreModel, $http ) {


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
            this.hidden = json && json.hidden;
            this.pausable = json && json.pausable;

            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'appId', 'displayName', 'icon', 'defaultModel', 'appWidth', 'appHeight', 'appType',
                'patronControllable', 'releaseLevel', 'description', 'isVirtual', 'hidden', 'pausable' ];
            return this.cloneUsingFields( fields );

        };

        // Didn't work, not critical....

        // this.refreshFromInfoJson = function(){
        //     var _this = this;
        //     return $http.get( '/blueline/opp/' + this.appId + '/info/info.json' )
        //         .then( function ( infoJson ) {
        //             _this.parseInbound(infoJson.data);
        //             return _this;
        //         } )
        //         .catch( function ( err ) {
        //             if ( err.status === 404 ) {
        //                 throw new Error( 'No info.json for that app.' );
        //             }
        //             throw err;
        //         } )
        //
        // }

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
        return sailsApi.apiGet( '/app?appId=' + appId )
            .then( function ( candidates ) {
                if ( candidates.length > 0 ) {
                    return newApp( candidates[ 0 ] );
                } else {
                    throw new Error( 'not found' );
                }
            } )
    }

    // This isn't really clean because we can fail for a vaiety of
    // reasons...
    function checkAppExists( appId ){
        return getByAppId(appId)
            .then( function(app){
                return true;
            })
            .catch( function(err){
                return false;
            })
    }

    function createFromInfoJson(appid){
        return $http.get('/blueline/opp/'+appid+'/info/info.json')
            .then(function(infoJson){
                return newApp(infoJson.data);
            })
            .catch(function(err){
                if (err.status === 404){
                    return new Error('No info.json for that app.');
                }
                return err;
            })
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:     getAll,
        new:        newApp,
        get:        getApp,
        getByAppId: getByAppId,
        createFromInfoJson: createFromInfoJson,
        checkAppExists: checkAppExists,
        selections: {
            releaseLevel: [ 'dev', 'alpha', 'beta', 'release' ]
        }
    }

} )