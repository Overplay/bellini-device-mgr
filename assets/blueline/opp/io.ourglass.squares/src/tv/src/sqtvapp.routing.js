import {name as regCompName} from './components/registration/registration.component'
import {name as rootCompName} from './components/root/root.component'
import {name as runningCompName} from './components/running/running.component'
import {name as gameoverCompName} from './components/gameover/gameover.component'

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/registration' );

    $stateProvider

        .state( 'registration', {
            url:       '/registration',
            component: regCompName
        } )

        .state( 'running', {
            url:       '/registration',
            component: runningCompName
        } )

        .state( 'gameover', {
            url:       '/gameover',
            component: gameoverCompName

        })



    console.log( "Route file run..." );

}