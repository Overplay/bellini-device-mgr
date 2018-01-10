/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */


import angular from 'angular';
import ourglassAPI from 'ogapi-es6';
import widgetComponent from './components/cahwidgetapp.component'
import CahGameService from './services/cahgame.service'

const ngModule = angular.module( 'ngApp', [ ourglassAPI ] );

// Register components

ngModule.component( widgetComponent.$name$, widgetComponent );
ngModule.service( CahGameService.serviceName, CahGameService );

ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('fullmodule test starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




