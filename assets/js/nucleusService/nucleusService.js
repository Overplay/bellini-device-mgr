/**
 * Created by mkahn on 4/9/16.
 */

/**
 *
 * Provides a wrapper for common Nucleus calls
 *
 */

(function ( window, angular ) {

    'use strict';
    angular.module( 'nucleus.service', [] )
        .factory( 'nucleus', function ( $http, $q, $rootScope, $log ) {

            var service = {};

            var _apiPath = '/api/v1';
            var _authorized = false;

            // Pull just the data off
            function stripData(resp){
                return resp.data;
            }

            // This little chunk of code is used all the time, just different endpoints
            function apiGet( endPoint ) {

                return $http.get( endPoint )
                    .then( stripData );

            }

            function apiPut( endPoint, params ) {

                return $http.put( endPoint, params )
                    .then( stripData );
            }

            function apiPost( endPoint, params ) {

                return $http.post( endPoint, params )
                    .then( stripData );

            }

            function apiDelete( endPoint ) {

                return $http.delete( endPoint )
                    .then( stripData );

            }


            service.authorize = function ( email, pass ) {


                // return $http.post('http://localhost:2000/auth/login', {email: email, password: pass, type: "local"}) //local required with facebook activated
                return $http.post( '/auth/login', { email: email, password: pass, type: "local" } ) //local required with facebook activated
                    .then( function ( resp ) {
                        $log.debug( "User is authorized." );
                        _authorized = true;
                        return resp.data;
                    } )
                    .catch( function ( err ) {
                        $log.error( "User could not be authorized." );
                        _authorized = false;
                        throw err;
                    } )

            }

            service.logout = function () {

                return $http.post( '/auth/logout' )
                    .then( function ( resp ) {
                        $log.debug( "User is logged out." );
                        _authorized = false;
                        return resp.data;
                    } )
                    .catch( function ( err ) {
                        $log.error( "User could not be logged out." );
                        _authorized = false;
                        throw err;
                    } )

            }


            service.getPasswordStatus = function( p1, p2 ) {
                if (!p1 || !p2) //fix js errors for undefined
                    return {pwdOk: false};

                var messages = [];

                if (p1.length < 8 )
                    messages.push("Password must be 8+ characters");

                if ( p1 != p2 )
                    messages.push("Passwords must match");

                // TODO: code smell
                if (messages.length > 1)
                    return { message: messages[0]+', '+messages[1], pwdOk: false}
                else if (messages.length == 1)
                    return { message: messages[0], pwdOk: false}
                else return { message: 'Looks good!', pwdOk: true};

            }
            
            service.reqNewPwd = function( email ){
            
                return $http.post( '/auth/reset', { email: email });
            }

            // TODO this should be tested to see if deleting one, deletes the other (ripple)
            service.deleteUser = function(authObj){

                if ( !authObj )
                    throw new Error( "Bad auth object" );

                return apiDelete( _apiPath+ '/auth/' + authObj.id )
                    .then( function () {
                        return apiDelete( _apiPath+ '/user/' + authObj.user.id );
                    } );


            }

            //TODO test validate TODO handle facebookId 
            service.addUser = function (email, password, userObj, facebookId, validate) {
                
                return $http.post('/auth/addUser', {
                        email: email,
                        password: password,
                        user: userObj,
                        facebookId: facebookId,
                        validate: validate
                    })
                    .then( function(data){
                        return data.data;
                    });
            
            }

            // =========== USERS ==========
            service.getUser = function ( userId ) {

                var endPoint = _apiPath + '/user' + (userId ? '/' + userId : '');
                return apiGet( endPoint );

            }

            service.updateUser = function ( userId, newFields ) {

                if (!userId)
                    throw new Error("Bad userId");
                
                
                var endPoint = _apiPath + '/user/' + userId;
                return apiPut( endPoint, newFields );

            }

            // =========== AUTHS ==========
            service.getAuth = function ( userId ) {

                var endPoint = _apiPath + '/auth' + (userId ? '/' + userId : '');
                return apiGet( endPoint );
            }

            service.updateAuth = function ( userId, newFields ) {

                if ( !userId )
                    throw new Error( "Bad userId" );


                var endPoint = _apiPath + '/auth/' + userId;
                return apiPut( endPoint, newFields );

            }
            
            /**
             * Change password. Must include either email or resetToken in the params
             * @param params email or resetToken must be in the params
             * @returns {HttpPromise}
             */
            service.changePassword = function ( params ) {

                return $http.post( '/auth/changePwd', params );

            }


            service.getMe = function(){
                return $http.get('auth/status').
                    then( function(data){
                        return data.data;
                    })
            }

            service.getMyEmail = function () {
                return $http.get( 'auth/status' ).then( function ( data ) {
                    return data.data.auth.email;
                } )
            }

            // =========== ROLES ==========
            service.getRole = function ( userId ) {

                var endPoint = _apiPath + '/role' + (userId ? '/' + userId : '');
                return apiGet( endPoint );
            }

            // =========== VENUES =========
            service.addVenue = function (venue) {
                
                var endPoint = 'venue/addVenue';
                return apiPost(endPoint, venue);
            }
           
            service.updateVenue = function (venueId, newFields) {

                if (!venueId)
                    throw new Error("Bad venueId");


                var endPoint = _apiPath + '/venue/' + venueId;
                return apiPut(endPoint, newFields);

            }
            
            service.deleteVenue = function (venueId) {
                if (!venueId)
                    throw new Error("Bad venueId");

                var endPoint = _apiPath + '/venue/' + venueId;
                return apiDelete(endPoint);
            }

            service.yelpSearch = function (fields) {
                if (!fields)
                    throw new Error("No params");
                
                var endPoint = '/venue/yelpSearch';
                return apiGet(endPoint, fields);
            }
            // =========== DEVICES ======== //TODO move to controllers? 

            
            service.updateDevice = function (deviceId, newFields) {

                if (!deviceId)
                    throw new Error("Bad deviceId");


                var endPoint = _apiPath + '/device/' + deviceId;
                return apiPut(endPoint, newFields);

            }

            service.mediaPath = function ( mediaId ) {
                return '/media/download/' + mediaId;
            }

            /**
             * Upload a media file.
             * @param file
             * @returns {deferred.promise|*}
             */

            service.uploadMedia = function ( file ) {

                var fd = new FormData();
                fd.append( 'file', file );

                // Content-Type undefined supposedly required here, transformed elsewhere
                return $http.post( '/media/upload', fd, {
                    transformRequest: angular.identity,
                    headers:          { 'Content-Type': undefined }
                } )
                    .then( stripData );

            }

            service.updateMedia = function ( mediaId, updateObject ) {
                var endpoint = _siteOrigin + '/media/' + mediaId;
                return $http.put( endpoint, updateObject )
                    .then( stripData );
            }


            return service;

        } );

})( window, window.angular );