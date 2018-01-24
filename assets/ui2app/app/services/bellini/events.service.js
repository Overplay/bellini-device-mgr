/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsEvents", function ( sailsApi, sailsCoreModel ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/event', queryString )
            .then( function ( events ) {
                return events.map( newEvent );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelEventObject( json ) {

        CoreModel.call( this );

        this.modelType = 'event';

        this.parseInbound = function ( json ) {
            this.name = json && json.name;
            this.description = json && json.description;
            this.date = json && json.date;
            this.data = json && json.data;
            this.type = json && json.type;
            this.uuid = json && json.uuid;
            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'name', 'description', 'date', 'data', 'type' ];
            return this.cloneUsingFields( fields );
        };

    }

    ModelEventObject.prototype = Object.create( CoreModel.prototype );
    ModelEventObject.prototype.constructor = ModelEventObject;

    var newEvent = function ( params ) {
        return new ModelEventObject( params );
    }

    var getEvent = function ( id ) {

        if ( id === 'new' )
            return newEvent( { name: 'Brand New Event' } );

        return sailsApi.getModel( 'event', id )
            .then( newEvent );
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll:     getAll,
        new:        newEvent,
        get:        getEvent
    }

} );