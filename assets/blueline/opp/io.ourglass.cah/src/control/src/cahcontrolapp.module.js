/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */

require('./assets/cahcontrol.scss');

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngTouch from 'angular-touch';
import uirouter from '@uirouter/angularjs';
import routing from './cahcontrolapp.routing';
import uiOGMobile from 'oguimobile-es6';

import ourglassAPI from 'ogapi-es6';
import CahControlService from './services/cahcontrol.service'
import RegComponent from './components/registration/registration.component'
import ConnectComponent from './components/connecting/connecting.component'
import DealComponent from './components/gameplay-dealing/gp-deal.component'

const ngModule = angular.module( 'ngApp', [ ourglassAPI, ngAnimate, ngTouch, uirouter, uiOGMobile ] );

// Register components

ngModule.service( CahControlService.serviceName, CahControlService );
ngModule.component( RegComponent.$name$, RegComponent );
ngModule.component( ConnectComponent.$name$, ConnectComponent );
ngModule.component( DealComponent.$name$, DealComponent );

// Configure routing
ngModule.config( routing );

ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('CAH Control starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




