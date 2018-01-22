import {name as regCompName} from './components/registration/registration.component'
import {name as gpCompName} from './components/gameplay/gameplay.component'
import {name as goCompName} from './components/gameover/gameover.component'

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/registration' );

    $stateProvider

        .state( regCompName, {
            url:       '/registration',
            component: regCompName
        } )

        .state( gpCompName, {
            url:       '/gameplay',
            component: gpCompName
        } )

        .state( goCompName, {
            url:       '/gameover',
            component: goCompName
        } )



    console.log( "Route file run..." );

}