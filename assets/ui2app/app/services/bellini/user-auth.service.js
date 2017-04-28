/**
 * Created by mkahn on 4/21/17.
 */

app.factory('userAuthService', function($http, $log ){

    $log.debug("Loading userAuthService");

    var userPromise = $http.get( '/user/checksession' ).then( stripHttpData );

    function stripData(data){ return data.data; }

    service = {};

    service.getCurrentUser = function(){
        return userPromise;
    };

    // =========== ROLES ==========
    service.getRole = function ( userId ) {
        var endPoint = '/api/v1/role' + (userId ? '/' + userId : '');
        return $http.get( endPoint ).then(stripData);
    };
    
    service.getRoles = function(){
        return this.getRole();
    };

    // ========== ADDING USERS ===========
    //TODO test validate TODO handle facebookId
    service.addUser = function ( email, password, userObj, facebookId, validate ) {

        return $http.post( '/auth/newUser', {
            email:      email,
            password:   password,
            user:       userObj,
            facebookId: facebookId,
            validate:   validate
        } )
            .then( stripData );

    };

    service.logout = function(){

        return $http.post( '/auth/logout', {} )
            .then( function ( resp ) {
                $log.debug( "User is logged out." );
                window.location = '/';
            } )
            .catch( function ( err ) {
                $log.error( "User could not be logged out." );
                throw err;
            } );
    };

    /**
     * Change password. Must include either email or resetToken in the params
     * @param { email: emailAddr, password: password }
     * @returns {HttpPromise}
     */
    service.changePassword = function ( params ) {
        return $http.post( '/auth/changePwd', params );
    };


    return service;
})