/**
 *  Control2
 *  ES6 Update of the original OG Control App
 *
 * */

require( './assets/styles/control2.scss' );

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngTouch from 'angular-touch';
import uirouter from '@uirouter/angularjs';

// Import Ourglass npm packages
// Common ui elements
import uiOGMobile from 'oguimobile-es6';
// API services
import ourglassAPI from 'ogapi-es6';

import routing from './control2.routes';
import OgNetService from './services/ognet.service';
import ControlAppService from './services/controlapp.service'
import TabsComponent from './components/toptabs/toptabs.component'
import OopsComponent from './components/oops/oops.component'
import LoadingComponent from './components/loading/loading.component'
import DashComponent from './components/dashboard/dash.component'
import AppCellComponent from './components/appcell/appcell.component'
import GuideComponent from './components/guide/guide.component'
import ScrollWindowDirective from './components/guide/scrollwindow.directive'
import StationCellComponent from './components/stationcell/stationcell.component'
import SmartTitleFilter from './filters/smarttitle.filter'
import SettingsComponent from './components/settings/settings.component'

// Define ngApp module
const ngModule = angular.module( 'ngApp', [ ourglassAPI, ngAnimate, ngTouch, uirouter, uiOGMobile ] );

// Create an Angular service from the OgNet class imported above.
ngModule.service( OgNetService.serviceName, OgNetService );
ngModule.service( ControlAppService.serviceName, ControlAppService );
ngModule.component( TabsComponent.$name$, TabsComponent );
ngModule.component( OopsComponent.$name$, OopsComponent );
ngModule.component( LoadingComponent.$name$, LoadingComponent );
ngModule.component( DashComponent.$name$, DashComponent );
ngModule.component( AppCellComponent.$name$, AppCellComponent );
//ngModule.directive( ScrollWindowDirective.$name$, [ '$log', ($log) => new ScrollWindowDirective($log) ] );
ngModule.directive( 'scrollWindow', [ '$log', ScrollWindowDirective ] );
ngModule.component( GuideComponent.$name$, GuideComponent );
ngModule.component( StationCellComponent.$name$, StationCellComponent );
ngModule.filter( 'smartTitle', SmartTitleFilter );
ngModule.component( SettingsComponent.$name$, SettingsComponent );


// Configure stateProvider
ngModule.config( [ '$stateProvider', function ( $stateProvider ) {

    // Parent is the ORIGINAL UNDECORATED builder that returns the `data` property on a state object
    $stateProvider.decorator( 'data', function ( state, parent ) {
        // We don't actually modify the data, just return it down below.
        // This is hack just to tack on the user resolve
        let stateData = parent( state );
        // Add a resolve to the state
        state.resolve = state.resolve || {};
        state.resolve.permissions = [ 'ogAPI', function ( ogAPI ) {
            return ogAPI.getPermissionsPromise();
        } ];
        // state.resolve.initComplete = [ 'ogAPI', function ( ogAPI ) {
        //     return ogAPI.initComplete;
        // } ];
        return stateData;
    } );

} ] );

// Configure routing. THIS MUST COME AFTER THE $stateProvider call above!!!
ngModule.config( routing );


ngModule.run( [ '$log', '$transitions',
    function ( $log, $transitions ) {

        $log.debug( 'Control2 starting...' );

        // Log out transition errors for debug
        $transitions.onError( {}, function ( transError ) {
            $log.debug( transError );
        } );

    } ] );


// Could have auto bootstrapped through HTML, but I prefer the manual in case we need to
// tweak the flow.
angular.bootstrap( document, [ 'ngApp' ] );
