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
import routing from './sqtvapp.routing';
import SqGameService from './services/sqgame.service'
import RunningComponent from './components/running/running.component'
import GameOverComponent from './components/gameover/gameover.component'

const ngModule = angular.module( 'ngApp', [ uirouter, ourglassAPI ] );

// Register components

ngModule.component( rootComponent.$name$, rootComponent );
ngModule.component( regComponent.$name$, regComponent );
ngModule.component( RunningComponent.$name$, RunningComponent);
ngModule.component( GameOverComponent.$name$, GameOverComponent);

ngModule.service( SqGameService.serviceName, SqGameService );

// Configure routing
ngModule.config( routing );

ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('SQ TV App starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




