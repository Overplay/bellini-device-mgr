/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsOGDevice", function ( sailsApi, sailsCoreModel, $q ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security

        var ep = '/ogdevice/all' + ( queryString ? "?" + queryString : '');

        return sailsApi.apiGet( ep )
            .then( function ( ogdevices ) {
                return ogdevices.map( newOGDevice );
            } )
    }

    const getStale = function ( daysStale ) {
        const d = daysStale || 7;
        const ep = '/ogdevice/stale?days=' + d;
        return sailsApi.apiGet( ep )
            .then( function ( ogdevices ) {
                return ogdevices.map( newOGDevice );
            } )
    };

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelOGDeviceObject( json ) {

        CoreModel.call( this );

        this.modelType = 'ogdevice'

        this.parseInbound = function ( json ) {
            this.deviceUDID = json && json.deviceUDID;
            this.atVenueUUID = json && json.atVenueUUID;
            this.name = json && json.name;
            this.runningApps = json && json.runningApps;
            this.systemAppState = json && json.systemAppState;
            this.logs = json && json.logs;
            this.hardware = json && json.hardware;
            this.software = json && json.software || true;
            this.data = json && json.data;
            this.lastContact = json && json.lastContact;
            this.pairedTo = json && json.pairedTo;
            this.currentProgram = json && json.currentProgram;
            this.timeZoneOffset = json && json.timeZoneOffset;
            this.favoriteChannels = json && json.favoriteChannels;
            this.hideChannels = json && json.hideChannels;
            this.tempRegCode = json && json.tempRegCode;


            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'atVenueUUID', 'name', 'favoriteChannels', 'hideChannels' ];
            return this.cloneUsingFields( fields );

        }

        this.populateVenue = function () {

            if ( !this.atVenueUUID )
                return $q.when( { name: "#unassigned#", id: "" } );

            var _this = this;
            return sailsApi.apiGet( '/venue/findByUUID?uuid=' + this.atVenueUUID )
                .then( function ( v ) {
                    _this.atVenue = v;
                    return _this;
                } )
                .catch( function ( err ) {
                    _this.atVenue = { name: "*** error ***", id: "" };
                    throw err;
                } )
        }

        this.lastContactAgo = function () {
            if ( !this.lastContact )
                return 'never';

            return moment( this.lastContact ).fromNow();
        }

    }

    ModelOGDeviceObject.prototype = Object.create( CoreModel.prototype );
    ModelOGDeviceObject.prototype.constructor = ModelOGDeviceObject;

    var newOGDevice = function ( params ) {
        return new ModelOGDeviceObject( params );
    }

    var getOGDeviceByUDID = function ( udid ) {
        return sailsApi.apiGet( '/ogdevice/findByUDID?deviceUDID=' + udid )
            .then( newOGDevice );
    }

    var get = function ( id ) {
        return sailsApi.getModel( 'ogdevice', id )
            .then( newOGDevice );
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:    getAll,
        new:       newOGDevice,
        getByUDID: getOGDeviceByUDID,
        get:       get,
        getStale:  getStale
    }

} );