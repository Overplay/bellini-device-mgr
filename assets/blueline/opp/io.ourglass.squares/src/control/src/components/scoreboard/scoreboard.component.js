import SqControlService from "../../services/sqcontrol.service";

require( './scoreboard.scss' );

import _ from 'lodash'


class SBController {
    constructor( $log, SqControlService ) {

        this.$log = $log;
        this.$log.debug( 'loaded SBController' );
        this.svc = SqControlService;

    }



    $onInit() {
        this.$log.debug( 'In $onInit' );

    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );

    }


    getQuarter(){

        if (this.svc.gameIsFinal) return "FINAL";

        const q = this.svc.currentQuarter;

        if (q>4 && !this.svc.gameIsFinal){
            return 'OVERTIME';
        }

        return 'Q'+q;
    }

    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService' ];
    }
}

export const name = 'scoreboardComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   SBController,
    controllerAs: '$ctrl',
    template:     `
        <div class="scoreboard-holder">
            <!-- only shows if game underway -->
            <div ng-if="$ctrl.svc.gameInfo.quarter">
                <h1 class="qtr">{{ $ctrl.getQuarter() }}</h1>
                <div class="score-entry">
                    <div class="team">{{ $ctrl.svc.gameInfo.team1.name }}</div>
                    <div class="score">{{ $ctrl.svc.gameInfo.team1.score }}</div>
                </div>
                <div class="score-entry">
                    <div class="team">{{ $ctrl.svc.gameInfo.team2.name }}</div>
                    <div class="score">{{ $ctrl.svc.gameInfo.team2.score }}</div>
                </div>
            </div>
            <!-- only shows if game has not started -->
            <div ng-if="!$ctrl.svc.gameInfo.quarter">
                <h1>UPCOMING</h1>
                <p>{{ $ctrl.svc.gameInfo.team1.name  }} &nbsp;VS.&nbsp; {{ $ctrl.svc.gameInfo.team2.name }}</p>
            </div>

        </div>
`
};

export default Component
