/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */


import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import ourglassAPI from 'ogapi-es6';
import rootComponent from './components/root/root.component'
import regComponent from './components/registration/registration.component'
import routing from './cahtvapp.routing';
import CahGameService from './services/cahgame.service'

const ngModule = angular.module( 'ngApp', [ uirouter, ourglassAPI ] );

// Register components

ngModule.component( rootComponent.$name$, rootComponent );
ngModule.component( regComponent.$name$, regComponent );

ngModule.service( CahGameService.serviceName, CahGameService );

// Configure routing
ngModule.config( routing );

ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('CAH TV App starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




