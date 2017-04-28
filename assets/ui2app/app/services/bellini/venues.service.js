/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsVenues", function ( sailsApi, sailsCoreModel, sailsOGDevice ) {


    var getAll = function ( queryString ) {
        // using non blueprint getter for security
        return sailsApi.apiGet( '/venue/all', queryString )
            .then( function ( venues ) {
                return venues.map( newVenue );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelVenueObject( json ) {

        CoreModel.call( this );

        this.modelType = 'venue'

        this.parseInbound = function ( json ) {
            this.name = json && json.name || '';
            this.yelpId = json && json.yelpId || '';
            this.uuid = json && json.uuid;
            this.address = json && json.address;
            this.logo = json && json.logo;
            this.geolocation = json && json.geolocation;
            this.showInMobileApp = json && json.showInMobileApp || true;
            this.venueOwners = json && json.venueOwners;
            this.venueManagers = json && json.venueManagers;
            this.organization = json && json.organization;
            this.sponsorships = json && json.sponsorships;
            this.virtual = json && json.virtual || false;
            this.devices = [];

            this.parseCore( json );
        };


        this.parseInbound( json );

        // TODO will need to determine how to handle the relation fields as we work on the UI
        this.getPostObj = function () {
            var fields = [ 'name', 'yelpId', 'address', 'geolocation', 'showInMobileApp',
                'virtual' ];
            return this.cloneUsingFields( fields );

        };

        this.populateDevices = function(){

            var _this = this;
            return sailsOGDevice.getAll('forVenueUUID='+this.uuid)
                .then( function(devices){
                    _this.devices = devices;
                    return _this;
                })

        };

        this.addUserAs = function(user, asType){
            if ( !_.includes(['manager', 'owner'], asType )) {
                throw new Error( 'Type must be owner or manager' );
            }

            var ep = (asType=='owner') ? '/venue/addOwner' : '/venue/addManager';

            var userId = sailsApi.idFromIdOrObj(user);

            var vid = this.id;

            return sailsApi.apiPost( ep, { userId: userId, id: this.id } )
                .then(function(data){
                    return getVenue(vid);
                });
        }

        this.addressString = function () {
            if (this.address) {
                var addr = this.address;

                return addr.street + " " +
                        (addr.street2 ? addr.street2 + " " : "") +
                        addr.city + ", " +
                        addr.state + " " +
                        addr.zip;
            }
        }

    }

    ModelVenueObject.prototype = Object.create( CoreModel.prototype );
    ModelVenueObject.prototype.constructor = ModelVenueObject;

    var newVenue = function ( params ) {
        return new ModelVenueObject( params );
    }

    var getVenue = function ( id ) {
        return sailsApi.getModel( 'venue', id )
            .then( newVenue );
    }

    var getByUUID = function ( uuid ) {
        return sailsApi.apiGet( '/venue/findbyuuid/' + uuid )
            .then( newVenue );
    }

    // Exports...new pattern to prevent this/that crap
    return {
        getAll:    getAll,
        new:       newVenue,
        get:       getVenue,
        getByUUID: getByUUID
    }

} )