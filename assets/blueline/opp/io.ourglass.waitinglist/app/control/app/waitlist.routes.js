/**
 * Created by noah on 6/28/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/home' );
    $stateProvider
        .state( 'home', {
            url:         "/home",
            templateUrl: 'app/components/homepage/home.html',
            controller:  'homeController',
            resolve: {

            }
        } )
        .state( 'add', {
            url:         "/add",
            templateUrl: 'app/components/addpage/add.html',
            controller:  'addController'
        } )
        .state( 'settings', {
            url:         "/settings",
            templateUrl: 'app/components/settings/settings.template.html',
            controller:  'settingsController'
        } );
});
