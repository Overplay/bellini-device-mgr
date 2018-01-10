require( './connect.scss' );

import { name as registrationState } from '../registration/registration.component'


const REG_OPEN = "Registration for the next game is open! To register, tap the button below.";
const REG_CLOSED = "A game is already in progress! If you'd like to watch the game, click the button below.";

const MSG2 = "If you'd prefer to just watch the game, click the WATCH button below.";

class ConnectCompController {
    constructor( $log, cahControl, $rootScope, $timeout, $state, uibHelper ) {

        this.$log = $log;
        this.$log.debug( 'loaded Connecting Controller.' );
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
        this.try2Connect();
    }

    try2Connect(){
        this.header = 'CONNECTING TO GAME';
        this.footer = 'PLEASE WAIT';
        this.showTryAgainButton = false;
        this.$timeout( () => {
            this.$log.debug( '~~~ Checking game state' );
            this.cahControl.getGameState(); // triggers the callback above
        }, 3000 );

        this.noConnectionTimeout = this.$timeout(()=>{
            this.header = "CAN'T CONNECT!";
            this.footer = '';
            this.showTryAgainButton = true;
        }, 5000);
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

export const name = 'connectComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: ConnectCompController,
    controllerAs: '$ctrl',
    template:     `
        <div class="anim-holder">
        <div class="header" ng-class="{ 'header-up' : $ctrl.connected }">{{ $ctrl.header }}</div>
            <div class="sk-folding-cube" ng-class="{ 'hidden': $ctrl.connected || $ctrl.showTryAgainButton }">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
            </div>
            <div class="curse" aa="animated  shake" ng-if="$ctrl.showTryAgainButton">¯\\_(ツ)_/¯</div>
            
            <div class="message">{{$ctrl.message}}</div>
            <div class="message top2vh bot3vh">{{$ctrl.message2}}</div>

            <button class="btn btn-warning btn-full top1vh" ng-if="$ctrl.showRegButton" ng-click="$ctrl.goReg()">REGISTER</button>
            <button class="btn btn-primary btn-full top1vh" ng-if="$ctrl.showWatchButton" ng-click="$ctrl.goWatch()">WATCH</button>
            

        <div class="footer">
            {{ $ctrl.footer }}
            <button class="btn btn-warning btn-full" ng-if="$ctrl.showTryAgainButton" ng-click="$ctrl.try2Connect()">TRY AGAIN</button>
        </div>

</div>

`
};

export default Component
