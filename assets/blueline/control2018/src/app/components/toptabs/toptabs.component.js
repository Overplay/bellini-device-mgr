/*********************************

 File:       toptabs.component.js
 Function:   Implements top tabs and bottom stripe for manager mode
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './tabs.scss' );


let _broadcastListeners = [];

class TopTabsController {
    constructor( $log, ogAPI, capSvc, $rootScope ) {

        this.$log = $log;
        this.$log.debug( 'loaded TopTabsController' );
        this.ogAPI = ogAPI;
        this.capSvc = capSvc;

        this.listener = $rootScope.$on( 'MASQUERADE_MODE_CHANGE', ( ev, data ) => {
            $log.debug( "Masquerade mode changed to: " + data.isMasquerading );
            this.permissions.isMaqueradingAsPatron = data.isMasquerading;
        } );

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.ogAPI.getPermissionsPromise()
            .then((perms)=>{
                this.permissions = perms;
            });
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.listener();
    }

    toggleMasqMode() {
        this.capSvc.toggleMasquerade();
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', 'ControlAppService', '$rootScope' ];
    }
}

export const name = 'topTabs';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   TopTabsController,
    controllerAs: '$ctrl',
    template:     `
    <!-- Manager Mode -->
<div class="og-tab-bar" ng-if="$ctrl.permissions.anymanager && !$ctrl.permissions.isMaqueradingAsPatron" ng-class="{'hide-tabs': $ctrl.capSvc.hideTabs }">
    <a class="ttab" ui-sref="dash" ui-sref-active="tabon">APPS</a>
    <a class="ttab" ui-sref="guide" ui-sref-active="tabon">TV</a>
    <a class="ttab" ui-sref="settings" ui-sref-active="tabon">SETTINGS</a>
</div>
<!-- PATRON MODE -->
<div class="og-tab-bar" ng-if="!$ctrl.permissions.anymanager || $ctrl.permissions.isMaqueradingAsPatron" ng-class="{'hide-tabs': $ctrl.capSvc.hideTabs }">
    <a class="ttab" ui-sref="dash" ui-sref-active="tabon">APPS</a>
    <a class="ttab" ui-sref="guide" ui-sref-active="tabon">TV</a>
</div>


<!-- Manager footer -->
<div class="og-bottom-banner bkg-og-medium-gray" ng-if="$ctrl.permissions.anymanager && !$ctrl.permissions.isMaqueradingAsPatron"
    ng-class="{'hide-footer': $ctrl.capSvc.hideTabs }">MANAGER MODE
    <span class="glyphicon glyphicon-user pull-right text-og-blue" style="padding-right: 5px;" ng-click="$ctrl.toggleMasqMode()"></span>
</div>

<!-- Manager masquerading as patron footer -->
<div class="og-bottom-banner bkg-og-medium-gray" ng-if="$ctrl.permissions.anymanager && $ctrl.permissions.isMaqueradingAsPatron"
    ng-class="{'hide-footer': $ctrl.capSvc.hideTabs }">
    PATRON MODE
    <span class="glyphicon glyphicon-glass pull-right text-og-blue" style="padding-right: 5px;"
          ng-click="$ctrl.toggleMasqMode()"></span>
</div>

`
};

export default Component


