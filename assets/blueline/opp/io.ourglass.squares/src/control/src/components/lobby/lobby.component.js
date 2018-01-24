require( './lobby.scss' );

import { name as registrationState } from '../registration/registration.component'


const REG_OPEN = "Registration for the next SQUARES game is open!";
const REG_CLOSED = "The game is already in progress, registration is closed :(";


class LobbyController {
    constructor( $log, sqControl, $rootScope, $timeout, $state, uibHelper, $stateParams ) {

        this.$log = $log;
        this.$log.debug( 'loaded Lobby Controller.' );
        this.sqControl = sqControl;
        this.$timeout = $timeout;
        this.$state = $state;
        this.uibHelper = uibHelper;
        this.$stateParams = $stateParams;

        this.$rootScope = $rootScope;
        this.connected = false;

        this.header = 'GAME LOBBY';

    }

    goToState(sceneState){

        switch ( sceneState ) {

            case 'registration':
                this.message = REG_OPEN;
                break;

            default:
                this.message = REG_CLOSED;

        }
    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

        if (this.$stateParams.state){
            this.goToState( this.$stateParams.state );
        }
    }

    goReg(){
        this.$state.go( registrationState );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    exit() {
        this.$log.debug( 'Exiting!' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService', '$rootScope', '$timeout', '$state', 'uibHelper', '$stateParams' ];
    }
}

export const name = 'lobbyComponent';

const Component = {
    $name$:       name,
    bindings:     { gameInfo: '<' },
    controller: LobbyController,
    controllerAs: '$ctrl',
    template:     `
        <div class="anim-holder">
        
            <div class="header" ng-class="{ 'header-up' : $ctrl.connected }">{{ $ctrl.header }}</div>
            
            <div class="message">{{$ctrl.message}}</div>
            
            <scoreboard-component game-info="$ctrl.gameInfo"></scoreboard-component>
            
            <div class="slots-remaining">{{ $ctrl.sqControl.openSlots}} Slot{{ $ctrl.sqControl.openSlots>1 ? 's':''}} Remaining</div>

            <button class="btn btn-warning btn-full top1vh" ng-if="$ctrl.sqControl.openSlots" ng-click="$ctrl.goReg()">REGISTER</button>
            

            <div class="footer">{{ $ctrl.footer }}</div>

        </div>
        <p class="debug-footer">lobby</p>


`
};

export default Component
