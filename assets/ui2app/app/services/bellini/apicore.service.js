/**
 * Created by mkahn on 4/19/17.
 */


app.factory( "sailsApi", function ( $http ) {

    service = {};

    var _apiPath = '/api/v1';

    function stripData(data){
        return data.data;
    }

    // This little chunk of code is used all the time, just different endpoints
    service.apiGet = function ( endPoint ) {
        return $http.get( endPoint )
            .then( stripData );
    }

    service.apiPut = function ( endPoint, params ) {
        return $http.put( endPoint, params )
            .then( stripData );
    }

    service.apiPost = function ( endPoint, params ) {
        return $http.post( endPoint, params )
            .then( stripData );
    }

    service.apiDelete = function ( endPoint ) {
        return $http.delete( endPoint )
            .then( stripData );
    }

    service.buildEp = function ( model, query ) {
        return _apiPath + '/' + model + ( query ? '?' + query : '' );
    }

    service.putCleanse = function ( modelObj ) {
        delete modelObj.createdAt;
        delete modelObj.updatedAt;
        delete modelObj.id;
        return modelObj;
    }

    // Convenience getter
    service.getModels = function ( model, query ) {
        var ep = this.buildEp( model, query );
        return this.apiGet( ep );
    }

    service.getModel = function ( model, id ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiGet( ep );
    }

    service.deleteModel = function ( model, id ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiDelete( ep );
    }

    service.updateModel = function ( model, id, params ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiPut( ep, params );
    }

    service.createModel = function ( model, params ) {
        var ep = this.buildEp( model );
        return this.apiPost( ep, params );
    }

    // Helper
    service.idFromIdOrObj = function ( source ) {
        if ( _.isString( source ) )
            return source;
        return source && source.id;
    }

    return service;

} );

app.factory( "sailsCoreModel", function ( sailsApi ) {


    function CoreModel() {

        this.modelType = 'core';

        this.parseCore = function ( json ) {
            this.createdAt = json && json.createdAt;
            this.updatedAt = json && json.updatedAt;
            this.id = json && json.id;
        }

    }

    CoreModel.prototype.update = function ( params ) {
        return sailsApi.updateModel( this.modelType, this.id, params || this.getPostObj() );
    }

    CoreModel.prototype.create = function () {
        var _this = this;
        return sailsApi.createModel( this.modelType, this.getPostObj() );
    }

    CoreModel.prototype.delete = function () {
        return sailsApi.deleteModel( this.modelType, this.id );
    }

    CoreModel.prototype.save = function () {
        if ( this.id ) return this.update();
        return this.create();
    }

    CoreModel.prototype.refresh = function () {
        return sailsApi.getModel( this.modelType, this.id );
    }
    
    CoreModel.prototype.cloneUsingFields = function(fields){
    
        var clone = {};
        fields.forEach( function(field){
            // Special syntax to pull dbid from object, or pass thru if already string dbId
            if (field.startsWith('@id:')){
                field = field.replace('@id:','');
                clone[field] = sailsApi.idFromIdOrObj(this[ field ]);
            } else {
                clone[ field ] = this[ field ];
            }

        }, this); // 'this' as second parameter makes sure 'this' is not global window 'this' in loop.
        
        return clone;
    }


    return {
        CoreModel: CoreModel
    }


} );