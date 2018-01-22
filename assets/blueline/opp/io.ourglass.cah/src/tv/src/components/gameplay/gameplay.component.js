require( './gp.scss' );
import CAHGame from '../../services/cahgame'
import _ from 'lodash'

class GPController {
    constructor( $log, cahGameService, $sce, $timeout, $rootScope ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV GPController.' );
        this.gameService = cahGameService;
        this.$sce = $sce;
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;

        this.winnerPickedWatcher = this.$rootScope.$on('WINNER_PICKED', this.winnerPicked.bind(this) );
    }

    resetForNewRound(){
        this.whiteCardIdx = 0;
        this.whiteCardCSS = { in: false, out: false };
        this.whiteCardToShow = null;
        this.showWinner = false;
        this.whiteCardWatcher = this.$rootScope.$on( 'WHITE_CARD_PLAYED', this.sequenceWhiteCards.bind( this ) );
    }

    startCardAnim() {
        this.whiteCardToShow = this.playedWhiteCards[ this.whiteCardIdx ];
        this.whiteCardCSS = { in: false, out: false };
        this.animT = this.$timeout( this.slideCardIn.bind(this), 500 );
    }

    slideCardIn() {
        this.whiteCardCSS.in = true;
        this.animT = this.$timeout( this.slideCardOut.bind( this ), 2500 );
    }

    slideCardOut() {
        this.whiteCardCSS = { in: false, out: true };
        this.animT = this.$timeout( this.nextWhiteCard.bind( this ), 500 );
    }

    nextWhiteCard() {
        this.whiteCardIdx = (this.whiteCardIdx + 1) % this.playedWhiteCards.length;
        this.sequenceWhiteCards.bind( this )();
    }

    sequenceWhiteCards() {

        this.whiteCardWatcher(); // we only want first card

        if ( !this.whiteCardIdx ) {
            this.playedWhiteCards = _.cloneDeep( CAHGame.playedWhiteCards );
        }

        if ( this.playedWhiteCards.length > 0 ) {
            this.$log.debug( "We have sufficient white cards to sequence" );
            this.startCardAnim();
        }

    }

    winnerPicked(ev, card){
        this.$timeout.cancel( this.animT );
        this.whiteCardToShow = card;
        this.showWinner = true;
        this.whiteCardCSS = { in: true, out: false };
        this.$log.debug('Winner picked!');
        this.$timeout(this.resetForNewRound.bind(this), 10000);
    }

    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.resetForNewRound();
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.$timeout.cancel( this.whiteCardWatcher );
    }


    getHeader() {
        return "HAND " + (CAHGame.currentHandNumber + 1) + " of " + CAHGame.numPlayers;
    }

    get blackCardPrompt() {
        return this.$sce.trustAsHtml( CAHGame.currentBlackCard.prompt.replace( '_', '<span class="blank">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' ) );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'cahGameService', '$sce', '$timeout', '$rootScope' ];
    }
}

export const name = 'gpComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   GPController,
    controllerAs: '$ctrl',
    template:     `
        <h1>{{ $ctrl.getHeader() }}</h1>
        <p ng-if="$ctrl.gameService.stateTimerRunning && !$ctrl.showWinner">{{$ctrl.gameService.stateTimerValue | minsec }}</p>
        <div class="black-card" ng-bind-html="$ctrl.blackCardPrompt"></div>
        <h1 class="winner" ng-if="$ctrl.showWinner">WINNER!</h1>
        <div class="white-card-holder">
         <div class="white-card" 
            ng-class="{ 'wc-in': $ctrl.whiteCardCSS.in, 'wc-out': $ctrl.whiteCardCSS.out, 'wc-winner': $ctrl.showWinner }">{{$ctrl.whiteCardToShow.prompt}}</div>
        </div>
       
`
};

export default Component
