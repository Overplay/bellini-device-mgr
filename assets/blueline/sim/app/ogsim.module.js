/**
 * Created by mkahn on 5/19/17.
 */

var app = angular.module( 'ogSim', [ 'ui.router', 'ui.bootstrap' ,'ngAnimate', 'toastr' ] );


app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        positionClass: 'toast-bottom-center'
    } );
} );


app.run( function ( $rootScope, $log ) {

    $rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
        event.preventDefault();
        $log.error( error );
    } );


} );


app.controller('mfController', function($scope, $log, $interval, bellini, mainframe, $rootScope ){

    $log.debug('Loading mfController');
    $scope.crawler = { src: '', pos: 0 };
    $scope.widget = { src: '', pos: 0 };


    function autoslide(){

        $interval( function () {

            $scope.crawler.pos = ($scope.crawler.pos + 1 ) % 2;

        }, 2500 );


        $interval( function () {

            $scope.widget.pos = ($scope.widget.pos + 1 ) % 4;

        }, 2500 );


    }

    function launchApp(data){
        if ( data.appType === 'crawler' ) {
            $scope.crawler.src = '/blueline/opp/' + data.appId + '/app/tv/index.html?deviceUDID=' + DEVICE_UDID;
        } else {
            $scope.widget.src = '/blueline/opp/' + data.appId + '/app/tv/index.html?deviceUDID=' + DEVICE_UDID;
        }
    }

    bellini.getAppStatusFromCloud()
        .then( function ( status ) {
            status.running.forEach(launchApp);
        } );

    $rootScope.$on('ACTION', function(event, data){

        $scope.$apply(function(){

            $log.debug( data );

            switch ( data.action ) {

                case 'launch':

                    launchApp(data);
                    bellini.appLaunchAck(data.appId, 0)
                        .then(function(resp){
                            $log.debug("Launch acked");
                        });
                    break;

                case 'move':

                    if ($scope.crawler.src.indexOf(data.appId)>0){
                        $scope.crawler.pos = ($scope.crawler.pos + 1 ) % 2;
                    } else if ( $scope.widget.src.indexOf( data.appId ) > 0 ) {
                        $scope.widget.pos = ($scope.widget.pos + 1 ) % 4;
                    }
                    break;

                case 'kill':

                    if ( $scope.crawler.src.indexOf( data.appId ) > 0 ) {
                        $scope.crawler.src = '';
                    } else if ( $scope.widget.src.indexOf( data.appId ) > 0 ) {
                        $scope.widget.src = '';
                    }

                    bellini.appKillAck( data.appId, 0 )
                        .then( function ( resp ) {
                            $log.debug( "Launch acked" );
                        } );
                    break;

            }


        });

    });


    $scope.vid = '/blueline/sim/assets/vid/soccer.mp4';

});