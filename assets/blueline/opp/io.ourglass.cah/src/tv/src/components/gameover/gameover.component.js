require( './gameover.scss' );
import CAHGame from '../../services/cahgame'

class GOController {
    constructor( $log ) {

        this.$log = $log;
        this.$log.debug( 'loaded GOController Controller.' );
        this.cahgame = CAHGame;
    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahGameService' ];
    }
}

export const name = 'gameOverComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   GOController,
    controllerAs: '$ctrl',
    template:     `
        <h1>GAME OVER</h1>
       <div class="res-holder" ng-repeat="p in $ctrl.cahgame.players | orderBy: '-handsWon.length'">
            <div class="place">{{p.handsWon.length }}</div>
            <div class="name">{{p.name}}</div>
        </div>
`
};

export default Component
