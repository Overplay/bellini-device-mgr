    /*********************************

     File:       ogConApp.module
     Function:   Base Control App V2
     Copyright:  Ourglass
     Author:     mkahn

     **********************************/


    var app = angular.module('ogConApp', [ 'ui.router', 'ui.bootstrap', 'ui.ogMobile', 'ngAnimate', 'toastr', 'ourglassAPI']);

    // This adds a current user permissions resolve to every single state
    app.config( function ( $stateProvider ) {

        // Parent is the ORIGINAL UNDECORATED builder that returns the `data` property on a state object
        $stateProvider.decorator( 'data', function ( state, parent ) {
            // We don't actually modify the data, just return it down below.
            // This is hack just to tack on the user resolve
            var stateData = parent( state );
            // Add a resolve to the state
            state.resolve = state.resolve || {};
            state.resolve.permissions = [ 'ogAPI', function ( ogAPI ) {
                return ogAPI.getPermissionsPromise();
            } ];
            return stateData;

        } );

    } );

    app.run( function ( $transitions, $log, ogNet ) {

        // Kick off init early to get promise running
        ogNet.init().then(function(){
            $log.debug("Init done in run method.");
        });

        $transitions.onError( {}, function ( transError ) {
            $log.debug( transError );
        } );



    } );