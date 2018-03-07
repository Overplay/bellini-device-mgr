/*********************************

 File:       appcell.component.js
 Function:   App Cell Component
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './appcell.scss' );


class AppCellController {
    constructor( $log, ogAPI, capSvc, $rootScope ) {

        this.$log = $log;
        this.$log.debug( 'loaded AppCellController' );
        this.ogAPI = ogAPI;
        this.capSvc = capSvc;
        this.$rootScope = $rootScope;

        this.muted = false;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );

    }

    launch() {
        this.ogAPI.launch( this.app.appId )
            .then(()=> {
                this.$log.debug( 'Launch was ok' );
            } )
            .catch( this.$log.error )
    }

    move() {
        this.ogAPI.move( this.app.appId )
            .then( () => {
                this.$log.debug( 'Move was ok' );
            } )
            .catch( this.$log.error )
    }

    kill() {
        this.ogAPI.kill( this.app.appId )
            .then( () => {
                this.$log.debug( 'Kill was ok' );
            } )
            .catch( this.$log.error )
    }

    mute() {
        this.muted =!this.muted;
        this.ogAPI.mute( this.app.appId, this.muted )
            .then( () => {
                this.$log.debug( 'Mute was ok' );
            } )
            .catch( this.$log.error );
    }

    control() {
        this.ogAPI.relocToControlApp( this.app )
    }


    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', 'ControlAppService', '$rootScope' ];
    }
}

export const name = 'appCell';

const Component = {
    $name$:       name,
    bindings:     { app: '<', permissions: '<', running: '<' },
    controller:   AppCellController,
    controllerAs: '$ctrl',
    template:     `
<div class="app-cell">
    <div class="app-icon">
        <img class="app-img" ng-src="{{$ctrl.app.iconPath}}"/>
    </div>
    <div class="app-cell-left" ng-if="$ctrl.running">
        <div class="app-name">
            {{$ctrl.app.displayName}}
        </div>
        <div class="app-cell-buttons">
            <button class="btn btn-warning" style="float: left;" ng-click="$ctrl.control()">
                {{ $ctrl.permissions.anymanager && !$ctrl.capSvc.isMasqueradingAsPatron ? 'CONTROL' : 'PLAY' }}</button>
            <button class="btn btn-primary" style="float: left;" ng-click="$ctrl.move()" 
                ng-if="$ctrl.permissions.anymanager && !$ctrl.capSvc.isMasqueradingAsPatron">MOVE</button>
            <button class="btn btn-danger" style="float: left;" ng-click="$ctrl.mute()" 
                ng-if="$ctrl.app.pausable && $ctrl.permissions.anymanager && !$ctrl.capSvc.isMasqueradingAsPatron">{{ $ctrl.muted ? "UNMUTE": "MUTE 2HRS" }}</button>
            <button class="btn btn-danger pull-right" style="" ng-click="$ctrl.kill()" 
                ng-if="$ctrl.permissions.anymanager && !$ctrl.capSvc.isMasqueradingAsPatron">X</button>
        </div>
    </div>

    <div class="app-cell-left" ng-if="!$ctrl.running" style="padding-top: 15px;" >
        <span class="app-name">{{$ctrl.app.displayName}} </span>
        <button class="btn btn-success btn-xs pull-right" ng-click="$ctrl.launch()" 
            ng-if="$ctrl.permissions.anymanager">
            <!--<span class="glyphicon glyphicon-expand"></span>-->
            LAUNCH
        </button>

    </div>

</div>
`
};

export default Component


