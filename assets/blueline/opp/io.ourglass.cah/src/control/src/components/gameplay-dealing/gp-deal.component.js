require( './deal.scss' );

import {name as connectState} from '../connecting/connecting.component'

let _broadcastListeners = [];

class DealController {
    constructor( $log, cahControl, $rootScope, $timeout, uibHelper, $state ) {

        this.$log = $log;
        this.$log.debug( 'loaded DealController' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.$state = $state;

        this.isRegistered = false;
        this.header = "LET'S GET IT ON!";
        this.message = "We just need to make sure you're still there and haven't gone off somewhere. Click READY when, you know, you're ready."
        this.showReadyButton = true;

        this.readyTimeout = 15;



    }

    registerBroadcastListeners(){
        this.bcastListeners = [];

        const gs = this.$rootScope.$on( 'GAME_STATE', ( ev, data ) => {
            this.$log.debug( "Got GAME_STATE notice in RegController" );
            if ( data.state !== 'registration' ) {
                this.uibHelper.headsupModal( "Registration Closed!", "Uh oh, looks like registration just closed." )
                    .then( () => {
                        this.$state.go( connectState );
                    } );
            }

        } );
        this.bcastListeners.push( gs );

    }

    readyTick(){
        this.readyTimeout--;
        this.readyButtonText = "CLICK WHEN READY ( "+this.readyTimeout+" )";

        if (this.readyTimeout===0){
            this.cahControl.unregister();
            this.uibHelper.headsupModal("U Snooze, U Lose", "You didn't confirm you were ready in time for this game and you've been kicked to the curb.")
                .then(()=>this.$state.go( connectState ));
        }

        this.readyTimer = this.$timeout(this.readyTick, 1000);
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

    ready() {
        this.$log.debug( 'Ready!' );
        this.$timeout.cancel(this.readyTimer);
        this.showReadyButton = false;
    }

    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', 'uibHelper', '$state' ];
    }
}

export const name = 'dealComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   DealController,
    controllerAs: '$ctrl',
    template:     `
        <div class="anim-holder">
        <div class="header header-up">{{ $ctrl.header }}</div>
           <div class="subhead">{{ $ctrl.message }}</div>
            <button class="btn btn-warning btn-full" ng-click="$ctrl.ready()" ng-if="$ctrl.showReadyButton">{{ $ctrl.readyButtonText }}</button>
        <div class="footer">
        </div>

</div>

`
};

export default Component
