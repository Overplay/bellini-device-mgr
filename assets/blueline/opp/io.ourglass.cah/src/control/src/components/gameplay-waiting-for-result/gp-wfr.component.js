require( './wfr.scss' );

import _ from 'lodash'

const WINNING_MESSAGES = [
    'WINNER WINNER CHICKEN DINNER',
    'CHECK OUT THE BIG BRAIN ON BRAD!',
    'YOU\'RE A VERY STABLE GENIUS!',
    '#WINNING'
];

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
            if (this.winner.id === this.cahControl.myPlayedCard.id){
                this.$log.debug('I won!');
                this.iwon = true;
                this.$timeout(()=>{this.iwon=false}, 3000);
            }

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

    wonmessage(){
        return _.sample(WINNING_MESSAGES);
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
        <div class="winner-winner" ng-class="{ 'pop-down': $ctrl.iwon }"><div class="inner">{{ $ctrl.wonmessage() }}</div> </div>
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
