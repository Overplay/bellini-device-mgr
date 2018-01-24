require( './running.scss' );
import SQGame from '../../services/sqgame'

class RunningController {
    constructor( $log, sqGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV Reg Controller.' );
        this.SQGame = SQGame;

    }

    getQuarter(){
        return "Q"+this.SQGame.currentQuarter
    }

    $onInit() {
        this.$log.debug( 'In $onInit' );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'sqGameService' ];
    }
}

export const name = 'runningComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: RunningController,
    controllerAs: '$ctrl',
    template:     `
        <h1>{{ $ctrl.getQuarter() }}</h1>
        <div class="score-holder">
            <div class="team">{{ $ctrl.SQGame.gameInfo.team1.name}}</div>
            <div class="score">{{ $ctrl.SQGame.gameInfo.team1.score }}</div>
        </div>
        <div class="score-holder">
            <div class="team">{{ $ctrl.SQGame.gameInfo.team2.name}}</div>
            <div class="score">{{ $ctrl.SQGame.gameInfo.team2.score }}</div>
        </div>
       <h1>Current Winner</h1>
       <p class="winner">{{ $ctrl.SQGame.currentLeader.name }}</p> 
       <div ng-if="$ctrl.SQGame.currentQuarter>1">
            <h1>Previous Winners</h1>
            <div class="qwinner-holder" ng-if="$ctrl.SQGame.currentQuarter>1">
               <p>First Q: {{ $ctrl.SQGame.gameInfo.perQscores.q1.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder" ng-if="$ctrl.SQGame.currentQuarter>2">
               <p>Second Q: {{ $ctrl.SQGame.gameInfo.perQscores.q2.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder" ng-if="$ctrl.SQGame.currentQuarter>3">
               <p>Third Q: {{ $ctrl.SQGame.gameInfo.perQscores.q3.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder" ng-if="$ctrl.SQGame.currentQuarter>4">
               <p>Fourth Q: {{ $ctrl.SQGame.gameInfo.perQscores.q4.winner.player.name }}</p>
            </div>
        </div>

`
};

export default Component
