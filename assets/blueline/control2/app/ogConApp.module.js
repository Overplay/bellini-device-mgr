/*********************************

 File:       ogConApp.module
 Function:   Base Control App V2
 Copyright:  Ourglass
 Date:       4/10/15
 Author:     mkahn

 **********************************/


var app = angular.module('ogConApp', [ 'ui.router', 'ui.bootstrap', 'ui.ogMobile', 'ngAnimate', 'toastr', 'ourglassAPI']);



app.run( function ( $rootScope, $log, ogNet ) {

    // Kick off init early to get promise running
    ogNet.init().then(function(){
        $log.debug("Init done in run method.");
    });

    $rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
        event.preventDefault();
        $log.error( error );
    } );

} );