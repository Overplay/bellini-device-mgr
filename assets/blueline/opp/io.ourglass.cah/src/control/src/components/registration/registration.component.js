require( './reg.scss' );

import {name as connectState} from '../connecting/connecting.component'
import { name as dealState } from '../gameplay-dealing/gp-deal.component'

let _broadcastListeners = [];

class RegController {
    constructor( $log, cahControl, $rootScope, $timeout, uibHelper, $state ) {

        this.$log = $log;
        this.$log.debug( 'loaded RegController' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.$state = $state;

        this.showRegButton = true;

        this.isRegistered = false;
        this.header = "REGISTRATION";
        this.showNameInput = true;
        this.showRegButton = true;
        this.showBagButton = false;


    }

    registerBroadcastListeners(){
        this.bcastListeners = [];

        const cdt = this.$rootScope.$on( 'START_COUNTDOWN_TICK', ( ev, data ) => {
            const minutes = Math.floor( data.time / 60 );
            let seconds = data.time - minutes * 60;
            if ( seconds < 10 ) seconds = "0" + seconds;
            this.countdownTimer = minutes + ':' + seconds;
            if ( data.time < 1 ) {
                this.$state.go( connectState ); // user did nothing and timed out
            }
        } );

        this.bcastListeners.push(cdt);

        const gs = this.$rootScope.$on( 'GAME_STATE', ( ev, data ) => {
            this.$log.debug( "Got GAME_STATE notice in RegController" );
            if ( data.state === 'starting' && this.cahControl.registered ) {
                this.$log.debug("Start called from TV!");
                this.$state.go(dealState);
            }

        } );
        this.bcastListeners.push( gs );

        const regsuc = this.$rootScope.$on( 'REGISTRATION_SUCCESS', ( ev, data ) => {
            this.$log.debug( "Got REGISTRATION_SUCCESS notice in RegController" );
            this.isRegistered = true;
            this.header = "WAITING FOR START";
            this.showNameInput = false;
            this.showRegButton = false;
            this.showBagButton = true;
        } );
        this.bcastListeners.push( regsuc );

        const regfail = this.$rootScope.$on( 'REGISTRATION_FAILURE', ( ev, data ) => {
            this.$log.debug( "Got REGISTRATION_FAILURE notice in RegController" );
            if (!this.isRegistered || data.name !== this.name ) // don't want to show for every one
                this.uibHelper.headsupModal( "Registration FAILED!", data.msg );
        } );
        this.bcastListeners.push( regfail );

        const os = this.$rootScope.$on( 'OPEN_SLOTS', ( ev, data ) => {
            this.$log.debug( "Got OPEN_SLOTS notice in RegController" );
            this.openSlots = data.slots;

            // Kill the no connection timer
            this.$timeout.cancel( this.noConnectionTimeout );

            if ( this.openSlots > 0 ) {
                this.message = REG_INST;
                this.showNameInput = true;
                this.showRegButton = true;
                this.showWatchButton = false;

            } else {
                this.message = REG_FULL;
                this.showNameInput = false;
                this.showRegButton = false;
                this.showWatchButton = true;
            }

        } );
        this.bcastListeners.push(os);


    }

    register() {
        if ( !this.name || this.name.length < 3 ) {
            this.uibHelper.headsupModal( "Yeah, that's not gonna work", 'Name or nickname needs to be at least 3 characters. Try a little creativity.' );
        } else {
            this.cahControl.register( this.name );
        }
    }

    bag(){

        this.uibHelper.confirmModal("Really Bail?",
            "Do you really want to unregister from this game and miss out on what will probably be one of the highlights of your life?", true )
            .then((answer)=>{
                if (answer) {
                    this.cahControl.unregister( this.name );
                    this.uibHelper.dryToast("Rehab is for quitters...");
                    this.$state.go( connectState );
                }
            })

    }

    goToAppState( appState ) {

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.registerBroadcastListeners();
        this.cahControl.getGameState(); // triggers the callback above

    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.bcastListeners.forEach( (ureg) => ureg() );
    }

    exit() {
        this.$log.debug( 'Exiting!' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', 'uibHelper', '$state' ];
    }
}

export const name = 'regComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   RegController,
    controllerAs: '$ctrl',
    template:     `
        <div class="anim-holder">
        <div class="header header-up">{{ $ctrl.header }}</div>
            <div class="form-group">
                <!--<label for="usr">Player Name:</label>-->
                <p ng-if="$ctrl.isRegistered" class="good2go">You're good to go, {{$ctrl.name}}!</p>
                <input type="text" class="form-control" id="usr" ng-model="$ctrl.name" placeholder="Name or Nickname" 
                        ng-if="$ctrl.showNameInput">
            </div>
            <button class="btn btn-warning btn-full" ng-if="$ctrl.showRegButton" ng-click="$ctrl.register()">REGISTER</button>
            <button class="btn btn-warning btn-full" ng-if="$ctrl.showBagButton" ng-click="$ctrl.bag()">BAIL on THIS GAME</button>


        <div class="footer">
                   <div class="countdown" ng-if="$ctrl.countdownTimer">Game Starting in: {{$ctrl.countdownTimer}}</div>
        </div>

</div>

`
};

export default Component
