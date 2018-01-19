import {name as regCompName} from './components/registration/registration.component'
import {name as rootCompName} from './components/root/root.component'

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



    console.log( "Route file run..." );

}