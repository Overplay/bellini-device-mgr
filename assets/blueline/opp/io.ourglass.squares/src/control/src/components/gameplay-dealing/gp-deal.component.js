require( './deal.scss' );

import {name as lobbyState} from '../lobby/lobby.component'

const READY_TIMEOUT = 30;

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

        this.readyTick = this.readyTick.bind(this);

        this.readyTimeout = READY_TIMEOUT;


    }

    readyTick(){
        this.readyTimeout--;
        this.readyButtonText = "CLICK WHEN READY ( "+this.readyTimeout+" )";

        if (this.readyTimeout===0){
            this.cahControl.unregister();
            this.uibHelper.headsupModal("U Snooze, U Lose", "You didn't confirm you were ready in time for this game and you've been kicked to the curb.")
                .then(()=>this.$state.go( lobbyState ));
        } else {
            this.readyTimer = this.$timeout( this.readyTick, 1000 );
        }

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        //this.registerBroadcastListeners();
        this.readyTick();
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        //this.bcastListeners.forEach( (ureg) => ureg() );
        this.$timeout.cancel( this.readyTimer );
    }

    ready() {
        this.$log.debug( 'Ready!' );
        this.$timeout.cancel(this.readyTimer);
        this.showReadyButton = false;
        this.message = 'Waiting for other players.'
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
            <button class="btn btn-warning btn-full top10vh" ng-click="$ctrl.ready()" ng-if="$ctrl.showReadyButton">{{ $ctrl.readyButtonText }}</button>
        <div class="footer">
        </div>

        </div>
        <p class="debug-footer">gameplay-dealing</p>
`
};

export default Component
