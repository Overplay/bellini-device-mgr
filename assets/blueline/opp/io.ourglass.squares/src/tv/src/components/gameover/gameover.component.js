require( './gameover.scss' );
import SQGame from '../../services/sqgame'

class GameOverController {
    constructor( $log, sqGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV GameOverController Controller.' );
        this.SQGame = SQGame;

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

export const name = 'gameOverComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller: GameOverController,
    controllerAs: '$ctrl',
    template:     `
       <h1>FINAL</h1>
        <div class="score-holder">
            <div class="team">{{ $ctrl.SQGame.gameInfo.team1.name}}</div>
            <div class="score">{{ $ctrl.SQGame.gameInfo.team1.score }}</div>
        </div>
        <div class="score-holder">
            <div class="team">{{ $ctrl.SQGame.gameInfo.team2.name}}</div>
            <div class="score">{{ $ctrl.SQGame.gameInfo.team2.score }}</div>
        </div>
       <h1>Overall Winner</h1>
       <p class="winner">{{ $ctrl.SQGame.currentLeader.name }}</p> 
       <div ng-if="$ctrl.SQGame.currentQuarter>1">
            <h1>Per Quarter Winners</h1>
            <div class="qwinner-holder">
               <p>1st Q: {{ $ctrl.SQGame.gameInfo.perQscores.q1.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder">
               <p>2nd Q: {{ $ctrl.SQGame.gameInfo.perQscores.q2.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder">
               <p>3rd Q: {{ $ctrl.SQGame.gameInfo.perQscores.q3.winner.player.name }}</p>
            </div>
            <div class="qwinner-holder">
               <p>4th Q: {{ $ctrl.SQGame.gameInfo.perQscores.q4.winner.player.name }}</p>
            </div>
        </div>
        
`
};

export default Component
