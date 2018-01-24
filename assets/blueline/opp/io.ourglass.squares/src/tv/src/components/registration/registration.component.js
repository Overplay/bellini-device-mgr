require( './reg.scss' );
import SQGame from '../../services/sqgame'

class RegController {
    constructor( $log, sqGameService ) {

        this.$log = $log;
        this.$log.debug( 'loaded TV Reg Controller.' );
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

export const name = 'regComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   RegController,
    controllerAs: '$ctrl',
    template:     `
        <h1>REGISTRATION</h1>
        <div class="matchup">
            <p>{{ $ctrl.SQGame.gameInfo.team1.name }}</p>
            <p>VS</p>
            <p>{{ $ctrl.SQGame.gameInfo.team2.name }}</p>
         </div>
         <div class="openspots">
            <p>open spots</p>
            <div class="num-spots">{{$ctrl.SQGame.slotsRemaining}}</div>
         </div>
`
};

export default Component
