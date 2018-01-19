import {name as lobbyCompName} from './components/lobby/lobby.component'
import {name as regCompName} from './components/registration/registration.component'
import {name as dealCompName} from './components/gameplay-dealing/gp-deal.component'
import {name as judgeCompName} from './components/gameplay-judging/gp-judge.component'
import {name as pickCompName} from './components/gameplay-picking/gp-picking.component'
import {name as watchCompName} from './components/gameplay-watching/gp-watch.component'
import {name as wfrCompName} from './components/gameplay-waiting-for-result/gp-wfr.component'

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/lobby' );

    $stateProvider

        .state( lobbyCompName, {
            url:       '/lobby',
            params: { state: null },
            component: lobbyCompName
        } )

        .state( regCompName, {
            url:       '/register',
            component: regCompName
        } )

        .state( dealCompName, {
            url:       '/deal',
            component: dealCompName
        } )

        .state( watchCompName, {
            url:       '/watch',
            component: watchCompName
        } )

        .state( pickCompName, {
            url:       '/pick',
            component: pickCompName
        } )

        .state( wfrCompName, {
            url:       '/wfr',
            component: wfrCompName
        } )

        .state( judgeCompName, {
            url:       '/judge',
            component: judgeCompName
        } )


    console.log( "Route file run..." );

}