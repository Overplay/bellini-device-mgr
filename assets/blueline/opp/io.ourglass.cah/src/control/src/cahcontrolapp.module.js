/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */

require( './assets/cahcontrol.scss' );

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngTouch from 'angular-touch';
import uirouter from '@uirouter/angularjs';
import routing from './cahcontrolapp.routing';
import uiOGMobile from 'oguimobile-es6';

import ourglassAPI from 'ogapi-es6';
import CahControlService from './services/cahcontrol.service'
import RegComponent from './components/registration/registration.component'
import LobbyComponent from './components/lobby/lobby.component'
import DealComponent from './components/gameplay-dealing/gp-deal.component'
import WatchComponent from './components/gameplay-watching/gp-watch.component'
import PickComponent from './components/gameplay-picking/gp-picking.component'
import JudgeComponent from './components/gameplay-judging/gp-judge.component'
import HandComponent from './components/hand-of-cards/hand-of-cards.component'
import ArrayComponent from './components/array-of-cards/array-of-cards.component'
import StateBannerComponent from './components/state-banner/state-banner.component'
import WFRComponent from './components/gameplay-waiting-for-result/gp-wfr.component'
import GOComponent from './components/gameover/gameover.component'

const ngModule = angular.module( 'ngApp', [ ourglassAPI, ngAnimate, ngTouch, uirouter, uiOGMobile ] );

// Register components

ngModule.service( CahControlService.serviceName, CahControlService );
ngModule.component( RegComponent.$name$, RegComponent );
ngModule.component( LobbyComponent.$name$, LobbyComponent );
ngModule.component( DealComponent.$name$, DealComponent );
ngModule.component( WatchComponent.$name$, WatchComponent );
ngModule.component( PickComponent.$name$, PickComponent );
ngModule.component( JudgeComponent.$name$, JudgeComponent );
ngModule.component( HandComponent.$name$, HandComponent );
ngModule.component( ArrayComponent.$name$, ArrayComponent );
ngModule.component( StateBannerComponent.$name$, StateBannerComponent );
ngModule.component( WFRComponent.$name$, WFRComponent );
ngModule.component( GOComponent.$name$, GOComponent);

// Configure routing
ngModule.config( routing );

ngModule.run( [ '$log', CahControlService.serviceName,
    function ( $log, cahControlService ) {
        $log.debug( 'CAH Control starting...' )
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




