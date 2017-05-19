/**
 * Created by mkahn on 5/19/17.
 */

var app = angular.module( 'ogSim', [ 'ui.router', 'ui.bootstrap' ,'ngAnimate', 'toastr' ] );




app.run( function ( $rootScope, $log ) {

    $rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
        event.preventDefault();
        $log.error( error );
    } );


} );


app.controller('mfController', function($scope, $log, $interval){

    $log.debug('Loading mfController');
    $scope.crawler = { src: '/blueline/opp/io.ourglass.ogcrawler/app/tv/index.html', pos: 0 };

    $interval( function(){

        $scope.crawler.pos = ($scope.crawler.pos + 1 )%2;

    }, 2500);

    $scope.widget = { src: '/blueline/opp/io.ourglass.shuffleboard/app/tv/index.html', pos: 0 };

    $interval( function () {

        $scope.widget.pos = ($scope.widget.pos + 1 ) % 4;

    }, 2500 );

});