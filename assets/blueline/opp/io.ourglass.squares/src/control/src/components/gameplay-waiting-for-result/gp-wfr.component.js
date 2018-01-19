require( './wfr.scss' );

import _ from 'lodash'



class WFRController {
    constructor( $log, cahControl, $rootScope ) {

        this.$log = $log;
        this.$log.debug( 'loaded WFRController' );
        this.cahControl = cahControl;
        this.$rootScope = $rootScope;

        // Can't I just connect to winner directly in the cahControl service?
        this.winnerListener = this.$rootScope.$on( 'WINNER_PICKED', ( ev, data ) => {
            this.$log.debug("Winner picked! "+data.card.prompt);
            this.winner = data.card;
        } );

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.playedWhiteCards = _.cloneDeep(this.cahControl.playedWhiteCards);
        this.winner = null;

    }

    $onDestroy(){
        this.$log.debug( 'In $onDestroy' );
        this.winnerListener();
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope' ];
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
        <div class="round-timer">{{ $ctrl.cahControl.roundTimerSec | minsec }}</div>
        
        <div class="hand-holder">
            <div class="centered">
                <aoc-component cards="$ctrl.playedWhiteCards" winner="$ctrl.winner"></aoc-component>
            </div>
        </div>
        <p class="debug-footer">WFR</p>

`
};

export default Component
