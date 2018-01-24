require( './reg.scss' );

import {name as lobbyState} from '../lobby/lobby.component'
import _ from 'lodash'

let _broadcastListeners = [];

let AUTO_REG = false;

function randomName() {

    let rval = _.sample( [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ] );
    rval += _.sample( [ 'a', 'e', 'i', 'o', 'u', 'y', 'h' ] );
    rval += _.sample( [ 'b', 'c', 'd', 'k', 'l', 'z', 'x' ] );
    rval += _.random( 1, 100 );
    return rval;

}

class RegController {
    constructor( $log, SqControlService, $rootScope, $timeout, uibHelper, $state ) {

        this.$log = $log;
        this.$log.debug( 'loaded RegController' );
        this.sqControl = SqControlService;
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

    gotoRegisteredMode() {
        this.isRegistered = true;
        this.header = "WAITING FOR START";
        this.showNameInput = false;
        this.showRegButton = false;
        this.showBagButton = true;
    }

    registerBroadcastListeners() {
        this.bcastListeners = [];

        const regsuc = this.$rootScope.$on( 'REGISTRATION_SUCCESS', ( ev, data ) => {
            this.$log.debug( "Got REGISTRATION_SUCCESS notice in RegController" );
            this.gotoRegisteredMode();
        } );
        this.bcastListeners.push( regsuc );

        const regfail = this.$rootScope.$on( 'REGISTRATION_FAILURE', ( ev, data ) => {
            this.$log.debug( "Got REGISTRATION_FAILURE notice in RegController" );
            if ( !this.isRegistered || data.name !== this.name ) // don't want to show for every one
                this.uibHelper.headsupModal( "Registration FAILED!", data.msg );
        } );
        this.bcastListeners.push( regfail );

        const starttimer = this.$rootScope.$on( 'ENOUGH_PLAYERS_TO_START', ( ev, data ) => {

            if ( data.timeout < 0 ) {
                this.$log.debug( 'Someone bailed and put us below timeout thresh.' );
                this.enuf2start = false;
                this.$timeout.cancel( this.regtimer );
                this.regtimer = null;
            } else {
                this.regTimerSec = data.timeout;
                // Only start the timer is it isn't started
                if ( !this.regtimer )
                    this.regTimerTick();
                this.enuf2start = true;
            }

        } );
        this.bcastListeners.push( starttimer );

    }

    regTimerTick() {
        this.regTimerSec--;
        if ( this.regTimerSec === 0 ) return;
        this.regtimer = this.$timeout( this.regTimerTick.bind( this ), 1000 );
    }

    register() {
        if ( !this.name || this.name.length < 3 ) {
            this.uibHelper.headsupModal( "Yeah, that's not gonna work", 'Name or nickname needs to be at least 3 characters. Try a little creativity.' );
        } else {
            this.sqControl.register( this.name );
        }
    }

    bag() {

        this.uibHelper.confirmModal( "Really Bail?",
            "Do you really want to unregister from this game and miss out on what will probably be one of the highlights of your life?", true )
            .then( ( answer ) => {
                if ( answer ) {
                    this.sqControl.unregister();
                    this.uibHelper.dryToast( "Rehab is for quitters..." );
                    this.$state.go( lobbyState );
                }
            } )

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.registerBroadcastListeners();

        if ( this.sqControl.myPlayer ) this.gotoRegisteredMode();

        this.name = this.sqControl.user.user.firstName + ' ' + this.sqControl.user.user.lastName.charAt( 0 );

        if ( AUTO_REG ) {
            this.name = randomName();
            this.register();
        }
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.bcastListeners.forEach( ( ureg ) => ureg() );
        this.$timeout.cancel( this.regtimer );
    }

    exit() {
        this.$log.debug( 'Exiting!' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService', '$rootScope', '$timeout', 'uibHelper', '$state' ];
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
                   <div class="countdown" ng-if="$ctrl.regtimer">Game Starting in: {{$ctrl.regTimerSec | minsec }}</div>
        </div>

</div>
        <p class="debug-footer">registration</p>

`
};

export default Component
