import {name as lobbyCompName} from './components/lobby/lobby.component'
import {name as regCompName} from './components/registration/registration.component'
import {name as gpCompName} from './components/gameplay/gameplay.component'

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/lobby' );

    $stateProvider

        .state( lobbyCompName, {
            url:       '/lobby',
            params: { state: null },
            component: lobbyCompName,
            resolve: {
                gameInfo: function( SqControlService ){
                    return SqControlService.gameInfo;
                }

            }
        } )

        .state( regCompName, {
            url:       '/register',
            component: regCompName
        } )

        .state( gpCompName, {
            url:       '/gameplay',
            component: gpCompName,
            resolve: {
                initdone: function( SqControlService ){
                    return SqControlService.initComplete;
                }
            }
        } )



    console.log( "Route file run..." );

}