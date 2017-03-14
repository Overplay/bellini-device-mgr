/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "wCoreModel", function ( $http, wApi, $log ) {


    function CoreModel() {

        this.modelType = 'core';
    }

    CoreModel.prototype.update = function ( params ) {
        return wApi.apiPut( wApi.buildEp( this.modelType ) + '/' + this.id, params || this.getPostObj() );

    }

    CoreModel.prototype.create = function () {
        var _this = this;
        return wApi.apiPost( wApi.buildEp( this.modelType ), this.getPostObj() )
            .then( function ( pdat ) {
                _this.parseInbound( pdat );
                return pdat;
            } );
    }

    CoreModel.prototype.delete = function () {
        return wApi.apiDelete( wApi.buildEp( this.modelType ) + '/' + this.id );
    }

    CoreModel.prototype.save = function () {
        if ( this.id ) return this.update();
        return this.create();
    }

    CoreModel.prototype.refresh = function () {
        var _this = this;
        return wApi.apiGet( wApi.buildEp( this.modelType ) + '/' + this.id )
            .then( function ( json ) {
                _this.parseInbound( json );
                return _this;
            } )
    }


    return {
        CoreModel: CoreModel
    }


});