/**
 * Created by mkahn on 4/6/16.
 */

var app = angular.module('uiApp', ['nucleus.service', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'toastr', 'uiGmapgoogle-maps', 'chart.js']);

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass:         'toast-bottom-center'
    } );
} );

app.config( function ( uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE'
    })
})

app.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        chartColors: ['#3FAD49', '#39A8FF'],
    });
}])

app.run( function ( $log, $rootScope , $http) {

    $log.info( "Asahi is pouring!" );

    $http.get('/uiapp/local.json').then(function(data){
        $rootScope.AJPGSUrl = data.data.AJPGSUrl
    })

    $rootScope.$on( '$stateChangeError',
        function ( event, toState, toParams, fromState, fromParams, error ) {
            $log.error( "State change fail!" );
        } )




} );

app.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
    }
});

app.filter('startFrom', function () {
    return function (input, start) {
//        start = parseInt(start);
        if (input)
            return input.slice(start);
        return null;
    }
})