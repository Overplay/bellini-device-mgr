require( './root.scss' );

import { name as registrationState } from '../registration/registration.component'



class RootCompController {
    constructor( $log, cahControl, $rootScope, $timeout, $state, uibHelper ) {

        this.$log = $log;
        this.$log.debug( 'loaded Root Controller.' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.$state = $state;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.connected = false;

        this.bcastListeners = [
            $rootScope.$on( 'GAME_STATE', ( ev, data ) => {
                this.$log.debug( "Got GAME_STATE notice in ConnectCompController" );
                this.connected = true;
                this.header = 'CONNECTED';
                this.footer = '';
                // Kill the no connection timer
                this.$timeout.cancel(this.noConnectionTimeout);

                switch(data.state){

                    case 'registration':
                        this.message = REG_OPEN;
                        this.message2 = MSG2;
                        this.showRegButton = true;
                        this.showWatchButton = true;
                        break;

                    default:
                        this.message = REG_CLOSED;
                        this.showWatchButton = true;

                }
            } )
        ];

    }

    goToAppState(appState){

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }


    goReg(){
        this.$state.go( registrationState );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.bcastListeners.forEach( ( ureg ) => ureg() );
    }

    exit() {
        this.$log.debug( 'Exiting!' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', '$state', 'uibHelper' ];
    }
}

export const name = 'rootComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:    RootCompController,
    controllerAs: '$ctrl',
    template:     `

`
};

export default Component
