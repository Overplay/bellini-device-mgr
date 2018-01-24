/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */

require( './assets/sqcontrol.scss' );

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngTouch from 'angular-touch';
import uirouter from '@uirouter/angularjs';
import routing from './sqcontrolapp.routing';
import uiOGMobile from 'oguimobile-es6';

import ourglassAPI from 'ogapi-es6';
import SQControlService from './services/sqcontrol.service'
import RegComponent from './components/registration/registration.component'
import LobbyComponent from './components/lobby/lobby.component'
import GameplayComponent from './components/gameplay/gameplay.component'
import StateBannerComponent from './components/state-banner/state-banner.component'
import ScoreboardComponent from './components/scoreboard/scoreboard.component'
import SquareCOmponent from './components/square/square.component'

const ngModule = angular.module( 'ngApp', [ ourglassAPI, ngAnimate, ngTouch, uirouter, uiOGMobile ] );

// Register components

ngModule.service( SQControlService.serviceName, SQControlService );
ngModule.component( RegComponent.$name$, RegComponent );
ngModule.component( LobbyComponent.$name$, LobbyComponent );
ngModule.component( GameplayComponent.$name$, GameplayComponent );

ngModule.component( StateBannerComponent.$name$, StateBannerComponent );
ngModule.component( ScoreboardComponent.$name$, ScoreboardComponent );
ngModule.component( SquareCOmponent.$name$, SquareCOmponent );


// Configure routing
ngModule.config( routing );

ngModule.run( [ '$log', SQControlService.serviceName,
    function ( $log, sqControlService ) {
        $log.debug( 'SQ Control starting...' )
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




