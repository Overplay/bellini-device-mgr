/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsOGLogs", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        return sailsApi.getModels( 'oglog', queryString )
            .then( function ( users ) {
                return users.map( newOGLog );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelOGLogObject( json ) {

        CoreModel.call( this );

        this.modelType = 'oglog'

        this.parseInbound = function ( json ) {

            this.logType = json && json.logType;
            this.message = json && json.message;
            this.deviceUDID = json && json.deviceUDID;
            this.loggedAt = json && json.loggedAt;


            this.parseCore( json );
        };

        // Should never be posting
        this.getPostObj = function () {
            throw new Error('Should not be modifying OGLogs')
        };

        this.parseInbound( json );


    }

    ModelOGLogObject.prototype = Object.create( CoreModel.prototype );
    ModelOGLogObject.prototype.constructor = ModelOGLogObject;

    var newOGLog = function ( params ) {
        return new ModelOGLogObject( params );
    }

    var getOGLog = function ( id ) {

        return sailsApi.getModel( 'oglog', id )
            .then( newOGLog );
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        get:    getOGLog
    }

} );