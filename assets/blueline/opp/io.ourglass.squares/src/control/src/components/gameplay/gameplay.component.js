require( './gameplay.scss' );

import _ from 'lodash';

let _broadcastListeners = [];

class GameplayController {
    constructor( $log, sqControl, $rootScope, $timeout, uibHelper, $state, $sce ) {

        this.$log = $log;
        this.$log.debug( 'loaded GameplayController' );

        this.sqControl = sqControl;
        this.$timeout = $timeout;
        this.uibHelper = uibHelper;

        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$sce = $sce;

        this.showingSquares = false;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.mySquares = _.cloneDeep(this.sqControl.mySquares);

    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );

    }


    // injection here
    static get $inject() {
        return [ '$log', 'SqControlService', '$rootScope', '$timeout', 'uibHelper', '$state', '$sce' ];
    }
}

export const name = 'gameplayComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   GameplayController,
    controllerAs: '$ctrl',
    template:     `
            <scoreboard-component></scoreboard-component>
            <div class="squares">
                <!--<h1>STANDINGS</h1>-->
                <h2>Current Winner</h2>
                    <p class="winner">{{ $ctrl.sqControl.currentLeader.player.name }}</p> 
                    <div ng-if="$ctrl.sqControl.currentQuarter>1">
                <h2>Previous Winners</h2>
                <div class="qwinner-holder" ng-if="$ctrl.sqControl.currentQuarter>1">
                    <div class="qtr">First Q</div>
                    <div class="name">{{ $ctrl.sqControl.gameInfo.perQscores.q1.winner.player.name }}</div>
                </div>
                <div class="qwinner-holder" ng-if="$ctrl.sqControl.currentQuarter>2">
                    <div class="qtr">Second Q</div>
                    <div class="name"> {{ $ctrl.sqControl.gameInfo.perQscores.q2.winner.player.name }}</div>
                </div>
                <div class="qwinner-holder" ng-if="$ctrl.sqControl.currentQuarter>3">
                    <div class="qtr">Third Q</div>
                    <div class="name"> {{ $ctrl.sqControl.gameInfo.perQscores.q3.winner.player.name }}</div>
                </div>
                
                <div class="qwinner-holder" ng-if="$ctrl.sqControl.currentQuarter>4">
                    <div class="qtr">Fourth Q</div>
                    <div class="name"> {{ $ctrl.sqControl.gameInfo.perQscores.q4.winner.player.name }}</div>
                 </div>
            </div>
                <h1>YOUR SQUARES</h1>
                  <table class="table table-bordered">
                    <tr>
                        <th></th>
                        <th>{{ $ctrl.sqControl.gameInfo.team1.name }}</th>
                        <th>{{ $ctrl.sqControl.gameInfo.team2.name }}</th>
                    </tr>
                    <tr ng-repeat="sq in $ctrl.mySquares">
                        <td>Square {{$index}}</td>
                        <td>{{ sq.team1digit }}</td>
                        <td>{{ sq.team2digit }}</td>
                    </tr>
                </table>
            </div>
        

`
};

export default Component


/*

<div uib-accordion-group class="panel-default" is-open="$ctrl.showingSquares">
                    <uib-accordion-heading>
        Your Squares<i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': $ctrl.showingSquares, 'glyphicon-chevron-right': !$ctrl.showingSquares}"></i>
      </uib-accordion-heading>
      World
    </div>


 */