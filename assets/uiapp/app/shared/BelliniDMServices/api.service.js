/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "wApi", function ( $http, $log ) {

    service = {};

    var _apiPath = '/api/v1';


    // This little chunk of code is used all the time, just different endpoints
    service.apiGet = function( endPoint ) {

        return $http.get( endPoint )
            .then( function ( resp ) {
                return resp.data;
            } );

    }

    service.apiPut = function( endPoint, params ) {

        return $http.put( endPoint, params )
            .then( function ( resp ) {
                return resp.data;
            } );

    }

     service.apiPost = function( endPoint, params ) {

        return $http.post( endPoint, params )
            .then( function ( resp ) {
                return resp.data;
            } );

    }

    service.apiDelete = function( endPoint ) {

        return $http.delete( endPoint )
            .then( function ( resp ) {
                return resp.data;
            } );

    }

    service.buildEp = function( model, query ) {

        return _apiPath + '/' + model + ( query ? '?' + query : '' );
    }

    service.putCleanse = function( modelObj ) {

        delete modelObj.createdAt;
        delete modelObj.updatedAt;
        delete modelObj.id;
        return modelObj;

    }

    // Convenience getter
    service.getModels = function(model, query){
        var ep = this.buildEp( model, query );
        return this.apiGet(ep);
    }

    service.getModel = function(model, id){
        var ep = this.buildEp(model)+"/"+id;
        return this.apiGet(ep);
    }

    service.deleteModel = function ( model, id ) {
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiDelete( ep );
    }

    service.updateModel = function( model, id, params ){
        var ep = this.buildEp( model ) + "/" + id;
        return this.apiPut(ep, params);
    }

    service.createModel = function ( model, params ) {
        var ep = this.buildEp( model );
        return this.apiPost( ep, params );
    }

    // Helper
    service.idFromIdOrObj = function( source )
    {
        if ( _.isString( source ) )
            return source;
        return source && source.id;
    }



    return service;

} )