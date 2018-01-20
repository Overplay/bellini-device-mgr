require( './wfr.scss' );

import _ from 'lodash'



class WFRController {
    constructor( $log, cahControl, $rootScope, $timeout ) {

        this.$log = $log;
        this.$log.debug( 'loaded WFRController' );
        this.cahControl = cahControl;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;

        // Can't I just connect to winner directly in the cahControl service?
        this.winnerListener = this.$rootScope.$on( 'WINNER_PICKED', ( ev, data ) => {
            this.$log.debug("Winner picked! "+data.card.prompt);
            this.winner = data.card;
            this.cahControl.killRoundTimer();

        } );

    }

    loadPlayedCards(){

        if (!this.cahControl.playedWhiteCards){
            this.$timeout( this.loadPlayedCards, 1000 ); //TODO this should be handled in the model with a Promise!
        } else {
            this.playedWhiteCards = _.cloneDeep( this.cahControl.playedWhiteCards );
        }

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.winner = null;
        this.cahControl.startRoundTimer(120);
        this.loadPlayedCards();
    }

    $onDestroy(){
        this.$log.debug( 'In $onDestroy' );
        this.winnerListener();
        this.cahControl.killRoundTimer();
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout' ];
    }
}

export const name = 'wrfComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   WFRController,
    controllerAs: '$ctrl',
    template:     `
        <div class="black-top">
            <!--<h1>BLACK CARD</h1>-->
            <div class="prompt" ng-bind-html="$ctrl.cahControl.blackCardPrompt"></div>
            <div class="judge">Card Czar: {{$ctrl.cahControl.judgeName}}</div>
        </div>
        <div class="round-timer" ng-if="!$ctrl.winner">{{ $ctrl.cahControl.roundTimerSec | minsec }}</div>
        
        <div class="hand-holder">
            <div class="centered">
                <aoc-component cards="$ctrl.playedWhiteCards" winner="$ctrl.winner"></aoc-component>
            </div>
        </div>
        <p class="debug-footer">WFR</p>

`
};

export default Component
