require( './lobby.scss' );

import { name as registrationState } from '../registration/registration.component'


const REG_OPEN = "Registration for the next game is open! To register, tap the button below.";
const REG_CLOSED = "A game is already in progress! If you'd like to watch the game, click the button below.";

const MSG2 = "If you'd prefer to just watch the game, click the WATCH button below.";

class LobbyController {
    constructor( $log, cahControl, $rootScope, $timeout, $state, uibHelper, $stateParams ) {

        this.$log = $log;
        this.$log.debug( 'loaded Lobby Controller.' );
        this.cahControl = cahControl;
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
                this.message2 = MSG2;
                this.showRegButton = true;
                this.showWatchButton = true;
                this.connected = true;
                break;

            default:
                this.message = REG_CLOSED;
                this.showWatchButton = true;

        }
    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

        if (this.$stateParams.state){
            this.goToState( this.$stateParams.state );
        } else {
            this.try2Connect();
        }

    }

    try2Connect(){
        this.header = 'CONNECTING TO GAME';
        this.footer = 'PLEASE WAIT';
        this.showTryAgainButton = false;
        this.$timeout( () => {
            this.$log.debug( '~~~ Checking game state' );
            this.connected = true;
            this.footer = '';
            this.goToState(this.cahControl.gameState);
        }, 3000 );

        // this.noConnectionTimeout = this.$timeout(()=>{
        //     this.header = "CAN'T CONNECT!";
        //     this.footer = '';
        //     this.showTryAgainButton = true;
        // }, 5000);
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
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', '$state', 'uibHelper', '$stateParams' ];
    }
}

export const name = 'lobbyComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: LobbyController,
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
            <div class="curse" aa="animated  shake" ng-if="$ctrl.showTryAgainButton">¯\(ツ)_/¯</div>
            
            <div class="message">{{$ctrl.message}}</div>
            <div class="message top2vh bot3vh">{{$ctrl.message2}}</div>

            <button class="btn btn-warning btn-full top1vh" ng-if="$ctrl.showRegButton" ng-click="$ctrl.goReg()">REGISTER</button>
            <button class="btn btn-primary btn-full top1vh" ng-if="$ctrl.showWatchButton" ng-click="$ctrl.goWatch()">WATCH</button>
            

        <div class="footer">
            {{ $ctrl.footer }}
            <button class="btn btn-warning btn-full" ng-if="$ctrl.showTryAgainButton" ng-click="$ctrl.try2Connect()">TRY AGAIN</button>
        </div>

        </div>
        <p class="debug-footer">lobby</p>


`
};

export default Component
