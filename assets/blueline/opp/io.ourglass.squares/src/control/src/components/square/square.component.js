require( './square.scss' );

import _ from 'lodash'


class SquareController {
    constructor( $log, SqControlService ) {

        this.$log = $log;
        this.$log.debug( 'loaded SBController' );
        this.sqControl = SqControlService;

    }



    $onInit() {
        this.$log.debug( 'In $onInit' );

    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );

    }

    exit() {
        this.$log.debug( 'Exiting!' );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService' ];
    }
}

export const name = 'squareComponent';

const Component = {
    $name$:       name,
    bindings:     { square: '<'},
    controller:   SquareController,
    controllerAs: '$ctrl',
    template:     `
        <div class="square-holder">
                <div class="top-half">
                    <div class="team">{{ $ctrl.sqControl.gameInfo.team1.name }}</div>
                    <div class="digit">{{ $ctrl.square.team1digit }}</div>
                </div>
                <div class="bottom-half">
                    <div class="team">{{ $ctrl.sqControl.gameInfo.team2.name }}</div>
                    <div class="digit">{{ $ctrl.square.team2digit }}</div>
                </div>
        </div>
`
};

export default Component
