require( './gameover.scss' );

import _ from 'lodash'



class GameOverController {
    constructor( $log, cahControl, $rootScope, $timeout ) {

        this.$log = $log;
        this.$log.debug( 'loaded GameOverController' );
        this.cahControl = cahControl;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

    }

    $onDestroy(){
        this.$log.debug( 'In $onDestroy' );

    }


    // injection here
    static get $inject() {
        return [ '$log', 'cahControlService', '$rootScope', '$timeout' ];
    }
}

export const name = 'gameoverComponent';

const Component = {
    $name$:       name,
    bindings:     {  players: '<' },
    controller:   GameOverController,
    controllerAs: '$ctrl',
    template:     `
        <div class="results-holder">
        <h1>Final Results</h1>
        <div class="res-holder" ng-repeat="p in $ctrl.players | orderBy: '-handsWon.length'">
            <div class="place">{{p.handsWon.length }}</div>
            <div class="name">{{p.name}}</div>
        </div>
        </div>
        <p class="debug-footer">GameOver</p>

`
};

export default Component
