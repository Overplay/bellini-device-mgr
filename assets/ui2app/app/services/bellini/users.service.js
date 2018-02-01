/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsUsers", [ 'sailsApi', 'sailsCoreModel', 'sailsAuth', function ( sailsApi, sailsCoreModel, sailsAuth ) {


    var getAll = function ( queryString ) {
        return sailsApi.apiGet( '/user/all', queryString )
            .then( function ( users ) {
                return users.map( newUser );
            } )
    }

    var CoreModel = sailsCoreModel.CoreModel;

    function ModelUserObject( json ) {

        CoreModel.call( this );

        this.modelType = 'user'

        this.parseInbound = function ( json ) {
            this.firstName = json && json.firstName || '';
            this.lastName = json && json.lastName || '';
            this.metadata = json && json.metadata;
            this.mobilePhone = json && json.mobilePhone;
            this.legal = json && json.legal;
            this.address = json && json.address;
            this.demographics = json && json.demographics;
            this.registeredAt = json && json.registeredAt;
            this.ownedVenues = json && json.ownedVenues;
            this.managedVenues = json && json.managedVenues;
            this.organization = json && json.organization;
            this.email = json && json.auth && json.auth.email;
            this.auth = json && json.auth && sailsAuth.new( json.auth );
            this.blocked = this.auth && this.auth.blocked;
            this.ring = this.auth && this.auth.ring || 10;

            this.isAdmin = this.ring === 1;
            // these aren't used in device manager
            // this.isOwner = (this.ring === 3) && this.ownedVenues.length > 0;
            // this.isManager = this.ring === 3 && this.managedVenues.length > 0;
            // this.isAdvertiser = this.ring === 4;

            this.parseCore( json );
        };

        this.getPostObj = function () {
            var fields = ['firstName', 'lastName', 'metadata', 'mobilePhone', 'legal', 'address'];
            return this.cloneUsingFields(fields);
        };

        this.parseInbound( json );

        // // Array of objects but each object must have an id field
        // this.updateRoles = function(newRoleArray){
        //     this.roles = _.map(newRoleArray, 'id');
        // }

        this.updateBlocked = function(){
            this.auth.blocked = !!this.blocked;
            return this.auth.save();
        }

        this.setRing = function ( ring ) {
            var _this = this;
            this.auth.ring = ring;
            return this.auth.save()
                .then( function ( val ) {
                    _this.ring = ring;
                    return val;
                } );
        }

        // // TODO: lots of replicated code below
        // this.attachToVenue = function( venue, asType ){
        //
        //     if ( !_.includes( [ 'manager', 'owner' ], asType ) ) {
        //         throw new Error( 'Type must be owner or manager' );
        //     }
        //
        //     var params = {
        //         venueId: sailsApi.idFromIdOrObj(venue),
        //         userId: this.id,
        //         userType: asType
        //     };
        //
        //     return sailsApi.apiPost('/user/attachUserToVenue', params )
        //         .then(function(updatedUser){
        //             return newUser(updatedUser);
        //         });
        // }
        //
        // this.removeFromVenue = function ( venue, asType ) {
        //
        //     if ( !_.includes( [ 'manager', 'owner' ], asType ) ) {
        //         throw new Error( 'Type must be owner or manager' );
        //     }
        //
        //     var params = {
        //         venueId:  sailsApi.idFromIdOrObj( venue ),
        //         userId:   this.id,
        //         userType: asType
        //     };
        //
        //     return sailsApi.apiPost( '/user/removeUserFromVenue', params )
        //         .then( function ( updatedUser ) {
        //             return newUser( updatedUser );
        //         } );
        // }

    }

    ModelUserObject.prototype = Object.create( CoreModel.prototype );
    ModelUserObject.prototype.constructor = ModelUserObject;

    var newUser = function ( params ) {
        return new ModelUserObject( params );
    }

    var getUser = function ( id ) {

        if (id=='new'){
            return newUser({ firstName: 'New', lastName: 'User' }); // empty user
        }

        return sailsApi.getModel( 'user', id )
            .then( newUser );
    }


    var getByEmail = function( emailAddress ){
        return sailsApi.getModels( 'auth', 'email='+emailAddress)
            .then( function(models){
                if (!models.length){
                    var eobj = { status: 404, body: { error: 'no such user' } };
                    throw new Error();
                }

                return models[0].user.id;
            })
            .then( function(id){
                return getUser(id);
            })
    }

    var analyze = function(){
        return sailsApi.apiGet('/user/analyze');
    }



    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        new:    newUser,
        get:    getUser,
        analyze: analyze,
        getByEmail: getByEmail
        }

}] );