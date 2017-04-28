/**
 * Created by mkahn on 10/19/16.
 */


app.factory( "sailsUsers", function ( sailsApi, sailsCoreModel, sailsAuth, userAuthService ) {


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
            this.roles = json && json.roles;
            this.ownedVenues = json && json.ownedVenues;
            this.managedVenues = json && json.managedVenues;
            this.organization = json && json.organization;
            this.email = json && json.auth && json.auth.email;
            this.roleTypes = json && json.roleTypes;
            this.auth = json && json.auth && sailsAuth.new( json.auth );
            this.blocked = this.auth && this.auth.blocked;

            this.parseCore( json );
        };

        this.getPostObj = function () {
            var fields = ['firstName', 'lastName', 'metadata', 'mobilePhone', 'legal', 'address',
                'demographics', 'roles' ];
            return this.cloneUsingFields(fields);
        };

        this.parseInbound( json );

        // Array of objects but each object must have an id field
        this.updateRoles = function(newRoleArray){
            this.roles = _.map(newRoleArray, 'id');
        }

        this.updateBlocked = function(){
            this.auth.blocked = !!this.blocked;
            return this.auth.save();
        }

        // TODO: lots of replicated code below
        this.attachToVenue = function( venue, asType ){

            if ( !_.includes( [ 'manager', 'owner' ], asType ) ) {
                throw new Error( 'Type must be owner or manager' );
            }

            var params = {
                venueId: sailsApi.idFromIdOrObj(venue),
                userId: this.id,
                userType: asType
            };

            return sailsApi.apiPost('/user/attachUserToVenue', params )
                .then(function(updatedUser){
                    return newUser(updatedUser);
                });
        }

        this.removeFromVenue = function ( venue, asType ) {

            if ( !_.includes( [ 'manager', 'owner' ], asType ) ) {
                throw new Error( 'Type must be owner or manager' );
            }

            var params = {
                venueId:  sailsApi.idFromIdOrObj( venue ),
                userId:   this.id,
                userType: asType
            };

            return sailsApi.apiPost( '/user/removeUserFromVenue', params )
                .then( function ( updatedUser ) {
                    return newUser( updatedUser );
                } );
        }

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

    var getMe = function(){
        return userAuthService.getCurrentUser()
            .then( newUser );
    }

    var analyze = function(){
        return sailsApi.apiGet('/user/analyze');
    }


    // Exports...new pattern to prevent this/that crap
    return {
        getAll: getAll,
        new:    newUser,
        get:    getUser,
        getMe:  getMe,
        analyze: analyze
    }

} );