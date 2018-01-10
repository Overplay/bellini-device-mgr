import {name as connectingCompName} from './components/connecting/connecting.component'
import {name as regCompName} from './components/registration/registration.component'
import { name as dealCompName } from './components/gameplay-dealing/gp-deal.component'

routing.$inject = [ '$urlRouterProvider', '$locationProvider', '$stateProvider' ];

export default function routing( $urlRouterProvider, $locationProvider, $stateProvider ) {

    console.log( "Configuring angular routes" );

    $locationProvider.html5Mode( false );

    $urlRouterProvider.otherwise( '/connect' );

    $stateProvider

        .state( connectingCompName, {
            url:       '/connect',
            component: connectingCompName
        } )

        .state( regCompName, {
            url:       '/register',
            component: regCompName
        } )

        .state( dealCompName, {
            url:       '/deal',
            component: dealCompName
        } )


    console.log( "Route file run..." );

}