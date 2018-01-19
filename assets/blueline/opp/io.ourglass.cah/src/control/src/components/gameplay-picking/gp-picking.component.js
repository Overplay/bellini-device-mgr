require( './pick.scss' );

import {name as wfrState} from '../gameplay-waiting-for-result/gp-wfr.component'

let _broadcastListeners = [];

class PickController {
    constructor( $log, cahControl, $rootScope, $timeout, uibHelper, $state, $sce ) {

        this.$log = $log;
        this.$log.debug( 'loaded DealController' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$sce = $sce;

        this.mode = 'picking';

        this.chose = this.chose.bind( this );

        // this.stateChangeListener = this.$rootScope.$on('GAME_STATE_MSG',(ev, data)=>{
        //     if ( data.state !== this.mode ){
        //         this.startRoundTimer(); // reset round timer
        //         this.mode = data.state;
        //         if (this.mode === 'picking'){
        //             this.getHand();
        //         }
        //     }
        // });
        //
        // this.winnerListener = this.$rootScope.$on( 'WINNER_PICKED', ( ev, data ) => {
        //     this.$log.debug("Winner picked! "+data.card.prompt);
        //     this.winner = data.card;
        // } );

    }

    roundTimerTick() {

        this.roundTimerSec--;
        if ( this.roundTimerSec ) {
            this.roundTimerTimeout = this.$timeout( this.roundTimerTick.bind( this ), 1000 );
        } else {
            this.$log.debug( 'Round timer expired!' );
            this.$state.go(wfrState);
        }

    }

    killRoundTimer(){
        if ( this.roundTimerTimeout ) this.$timeout.cancel( this.roundTimerTimeout ); //kill olde
    }

    startRoundTimer(){
        this.killRoundTimer();
        this.roundTimerSec = 120; //2 min
        this.roundTimerTick();
    }

    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.winner = null;
        this.getHand();
        this.startRoundTimer();
    }

    $onDestroy(){
        this.$log.debug( 'In $onDestroy' );
        this.killRoundTimer();
        this.stateChangeListener(); //unreg
        this.winnerListener();
    }

    getHand() {
        this.hand = this.cahControl.getHand();
        // This is usually only during testing
        if ( !this.hand.black ) {
            this.$timeout( this.getHand.bind( this ), 1500 );
        } else {
            this.blackCard = this.$sce.trustAsHtml( this.hand.black.prompt.replace( '_', '<span class="blank">' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' ) );
        }
    }

    chose( card ) {
        this.$log.debug( "Chose: " + card.prompt );
        this.hasChosen = true;
        this.chosenCard = card;
        this.cahControl.playCard( card );
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.$timeout.cancel( this.roundTimerTimeout );

    }

    getTimerBkg(){
        if (this.hasChosen) return 'green-bg';
        if (this.roundTimerSec > 45 ) return '';
        if (this.roundTimerSec < 15) return 'red-bg';
        return 'yellow-bg';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout', 'uibHelper', '$state', '$sce' ];
    }
}

export const name = 'pickComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   PickController,
    controllerAs: '$ctrl',
    template:     `
        <div class="black-top">
            <!--<h1>BLACK CARD</h1>-->
            <div class="prompt" ng-bind-html="$ctrl.blackCard"></div>
            <div class="judge">Card Czar: {{$ctrl.cahControl.judgeName}}</div>
        </div>
        <div class="round-timer" ng-class="$ctrl.getTimerBkg()">{{ $ctrl.roundTimerSec | minsec }}</div>

        <div class="hand-holder" ng-if="$ctrl.cahControl.upstreamGameState==='pick'">
            <div class="centered">
                <hand-component hand="$ctrl.hand.myHand" card-chosen="$ctrl.chose"></hand-component>
            </div>
        </div>
        
        <div class="hand-holder" ng-if="$ctrl.cahControl.upstreamGameState==='judging'">
            <div class="centered">
                <aoc-component cards="$ctrl.cahControl.playedWhiteCards" winner="$ctrl.winner"></aoc-component>
            </div>
        </div>
        
        <div ng-if="$ctrl.cahControl.upstreamGameState==='judging">JUDGESHIT</div>
        <p class="debug-footer">picking for: {{ $ctrl.cahControl.playerName }}</p>

`
};

export default Component
