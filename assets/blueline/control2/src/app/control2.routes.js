import Globals from './globals'
import {name as oopsCompName} from './components/oops/oops.component'
import {name as loadingCompName} from './components/loading/loading.component'
import {name as dashCompName} from './components/dashboard/dash.component'
import {name as guideCompName} from './components/guide/guide.component'


require('./assets/test/mockguide.json');

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/loading' );

    // STATES
    //
    // venueoverview: Shows all venue-wide apps and all devices. This will replace the native view eventually in the
    // Bourbon
    // managerdash: Dashboard for managers
    // patrondash: Dashboard for patrons
    // tvguide: What it says
    // settings:What it says
    // oops: Landing for broken state, for dev only

    $stateProvider

        .state( 'oops', {
            url:       '/oops',
            component: oopsCompName
        } )

        .state( 'loading', {
            url:       '/loading',
            component: loadingCompName
        } )

        .state( 'dash', {
            url:       '/dash',
            component: dashCompName,
            resolve:   {
                apps: function ( ogNet ) {
                    return ogNet.getApps();
                }
            }
        } )

        .state( 'guide', {
            url:       '/guide',
            component: guideCompName,
            resolve:   {
                grid:           function ( ControlAppService ) {
                    return ControlAppService.getAllListings();
                },
                currentProgram: function ( ogAPI ) {
                    return ogAPI.getCurrentProgram();
                }
            }
        } )


}
