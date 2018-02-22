/*********************************

 File:       dash.component.js
 Function:   Device and Venue App dashboard
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './dash.scss' );
import _ from 'lodash';


class DashController {
    constructor( $log, $rootScope, uibHelper, $timeout, $state, cntrlSvc ) {
        this.$log = $log;
        this.$log.debug( 'loaded ManagerDashController' );
        this.$rootScope = $rootScope;
        this.uibHelper = uibHelper;
        this.$timeout = $timeout;
        this.$state = $state;
        this.cntrlSvc = cntrlSvc;

        this.listenerUnsub = this.$rootScope.$on(
            "$app_state_change",
            () => {
                this.$log.debug( "App State Change, reloading" );
                // toss up curtain
                this.uibHelper.curtainModal( '' );
                // allow for some round trip settle out
                this.$timeout( () => {
                    this.uibHelper.dismissCurtain();
                    this.$state.reload();
                }, 1000 );
            }
        );

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        if (!this.permissions.anymanager || this.cntrlSvc.isMasqueradingAsPatron){
            // need to filter the running apps
            _.remove( this.apps.running, function ( app ) {
                return !app.patronControllable;
            } );
        }
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.listenerUnsub(); // unsub $on listener
    }

    meplay(){
        window.location.href = "http://192.241.217.88:4000/ogcontrol/?aid=" + this.ogAPI.getDeviceUDID();
    }

    // injection here
    static get $inject() {
        return [ '$log', '$rootScope', 'uibHelper', '$timeout', '$state', 'ControlAppService' ];
    }
}

export const name = 'dashComponent';

const Component = {
    $name$:       name,
    bindings:     { apps: '<', permissions: '<' },
    controller:   DashController,
    controllerAs: '$ctrl',
    template:     `
<div class="container app-scroll">
    <div class="row">
        <div class="col-sm-12">
            <div class="row">
                <button style="width: 100%; margin: 10px 5px 10px 5px;" class="btn btn-info"
                        ng-click="$ctrl.meplay()"><span class="glyphicon glyphicon-headphones"></span>&nbsp;LISTEN
                </button>
            </div>
        </div>

    </div>
    <div class="row" >
        <div class="col-sm-12">
            <h4 class="text-og-green">RUNNING APPS</h4>
            <p class="no-apps" ng-show="$ctrl.apps.running.length < 1">There are no running apps.</p>
            <app-cell ng-repeat="app in $ctrl.apps.running | orderBy: 'displayName' track by $index" 
                      app="app" running="true"
                      permissions="$ctrl.permissions"></app-cell>
            <div ng-if="$ctrl.permissions.anymanager && !$ctrl.cntrlSvc.isMasqueradingAsPatron">
                <h4 class="text-og-orange">AVAILABLE APPS</h4>
                <p class="no-apps" ng-show="$ctrl.apps.available.length < 1">There are no available apps.</p>
                <app-cell ng-repeat="app in $ctrl.apps.available | orderBy: 'displayName' track by $index"
                    app="app" permissions="$ctrl.permissions"></app-cell>
            </div>
            
        </div>
    </div>
</div>

`
};

export default Component


