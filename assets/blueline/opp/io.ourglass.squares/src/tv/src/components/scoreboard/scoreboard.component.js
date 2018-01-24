require( './scoreboard.scss' );

import _ from 'lodash'


class SBController {
    constructor( $log, SqControlService, $rootScope ) {

        this.$log = $log;
        this.$log.debug( 'loaded SBController' );
        this.sqControl = SqControlService;

        this.$rootScope = $rootScope;



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
        return [ '$log', 'SqControlService', '$rootScope' ];
    }
}

export const name = 'scoreboardComponent';

const Component = {
    $name$:       name,
    bindings:     { gameInfo: '<'},
    controller:   SBController,
    controllerAs: '$ctrl',
    template:     `
        <div class="scoreboard-holder">
            <!-- only shows if game underway -->
            <div ng-if="$ctrl.gameInfo.quarter">
                <div class="score-entry">
                    <div class="team">{{ $ctrl.gameInfo.team1.name }}</div>
                    <div class="team">{{ $ctrl.gameInfo.team1.score }}</div>
                </div>
                <div class="score-entry">
                    <div class="team">{{ $ctrl.gameInfo.team2.name }}</div>
                    <div class="team">{{ $ctrl.gameInfo.team2.score }}</div>
                </div>
                <div class="qtr">{{ $ctrl.gameInfo.quarter }}</div>
            </div>
            <!-- only shows if game has not started -->
            <div ng-if="!$ctrl.gameInfo.quarter">
                <h1>UPCOMING</h1>
                <p>{{ $ctrl.gameInfo.team1.name  }} &nbsp;VS.&nbsp; {{ $ctrl.gameInfo.team2.name }}</p>
            </div>

        </div>
`
};

export default Component
