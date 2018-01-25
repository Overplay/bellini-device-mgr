require( './judge.scss' );

import {name as lobbyState} from '../lobby/lobby.component'


class JudgeController {
    constructor( $log, cahControl, $timeout, uibHelper, $sce ) {

        this.$log = $log;
        this.$log.debug( 'loaded JudgeController' );
        this.cahControl = cahControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;
        this.$sce = $sce;

        this.chose = this.chose.bind(this);

    }

    roundTimerTick() {

        this.roundTimerSec--;
        if ( this.roundTimerSec ) {
            this.roundTimerTimeout = this.$timeout( this.roundTimerTick.bind( this ), 1000 );
        } else {
            this.$log.debug( 'Round timer expired! Playing a random card.' );
            if ( !this.hasChosen ) {
                this.uibHelper.dryToast( 'You Snoozed, So We Chose a Winner 4 Ya!', 2000 );
                this.$timeout( () => {
                    this.cahControl.choseWinner( _.sample( this.cahControl.playedWhiteCards ) );
                }, 2000 );
            }
        }

    }

    killRoundTimer() {
        if ( this.roundTimerTimeout ) this.$timeout.cancel( this.roundTimerTimeout ); //kill olde
    }

    startRoundTimer() {
        this.killRoundTimer();
        this.roundTimerSec = 120; //2 min
        this.roundTimerTick();
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

    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.obfuscate = true;
        this.getHand();
        this.startRoundTimer();

    }

    chose(card){
        this.hasChosen = true;
        this.$log.debug("Judge chose: " + card.prompt);
        this.cahControl.choseWinner(card);

    }

    getTimerBkg() {
        if ( this.hasChosen ) return 'green-bg';
        if ( this.roundTimerSec > 45 ) return '';
        if ( this.roundTimerSec < 15 ) return 'red-bg';
        return 'yellow-bg';
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$timeout', 'uibHelper', '$sce' ];
    }
}

export const name = 'judgeComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: JudgeController,
    controllerAs: '$ctrl',
    template:     `
        <div class="black-top">
            <!--<h1>BLACK CARD</h1>-->
            <h1>YOU ARE JUDGING</h1>
            <div class="prompt" ng-bind-html="$ctrl.blackCard"></div>
        </div>
        <div class="round-timer" ng-class="$ctrl.getTimerBkg()">{{ $ctrl.roundTimerSec | minsec }}</div>
        <div class="hand-holder">
            <div class="centered">
               <hand-component hand="$ctrl.cahControl.playedWhiteCards" card-chosen="$ctrl.chose" 
                    chosen-prompt="SELECT WINNER" 
                    obfuscate="$ctrl.cahControl.upstreamGameState !== 'judging'"
                    confirm="true">
                </hand-component>
            </div>
        </div>
        <p class="debug-footer">judging</p>

`
};

export default Component
