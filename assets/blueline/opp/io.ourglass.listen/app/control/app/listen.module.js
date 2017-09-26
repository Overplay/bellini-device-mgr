/*********************************

 File:       listen.module
 Function:   Base App
 Copyright:  Ourglass
 Date:       9/26/2017
 Author:     mkahn

 Test app for listener.

 **********************************/


const app = angular.module('listenApp', [
    'ourglassAPI', 'ui.bootstrap', 'ui.ogMobile'
]);


app.controller( "listenController",
    function ( $scope, $timeout, $http, $log, ogAPI, uibHelper ) {
        JSMpeg.CreateVideoElements();
    });