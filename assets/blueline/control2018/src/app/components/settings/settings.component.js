/*********************************

 File:       Settings.component.js
 Function:   Settings for a device
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './settings.scss' );


class SettingsController {
    constructor( $log,uibHelper, ogNet, ogAPI ) {
        this.$log = $log;
        this.$log.debug( 'loaded SettingsController' );
        this.ogNet = ogNet;
        this.uibHelper = uibHelper;
        this.ogAPI = ogAPI;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    updateSystemName() {
        this.uibHelper.confirmModal( "Update?", "Are you sure you want to update the system name to: " + this.ogDevice.name + "?", true )
            .then( () => {
                let hud = this.uibHelper.curtainModal( 'Updating...' );
                this.ogNet.changeSystemName( this.ogDevice.name )
                    .then( ()  => {
                        hud.dismiss();
                        this.uibHelper.headsupModal( 'Settings Changed', 'Name successfully updated.' );
                    } )
            } )
            .catch(()=>this.uibHelper.dryToast("OK, then", 1000));
    }

    abandonBeta(){
        this.uibHelper.confirmModal('Switch Back?', "Are you sure you want to switch back to the older version of the control app? You will lose support for favorites and improved searches.", false)
            .then(()=>{
                this.ogAPI.venueModel.usebeta = false;
                this.ogAPI.saveVenueModel()
                    .then(()=>{
                        let url = '/blueline/control/index.html?deviceUDID=' + this.ogAPI.getDeviceUDID();
                        url += "&jwt=" + this.ogAPI.getJwt();
                        //window.href = url;
                        window.location.replace(url);
                    })
            })
    }

    // injection here
    static get $inject() {
        return [ '$log', 'uibHelper', 'ogNet', 'ogAPI' ];
    }
}

export const name = 'settingsComponent';

const Component = {
    $name$:       name,
    bindings:     { ogDevice: '<' },
    controller:   SettingsController,
    controllerAs: '$ctrl',
    template:     `
<div class="container">
    <div class="row">
        <div class="col-md-10">
            <!--<h4>SYSTEM</h4>-->
            <form style="margin-top: 10px;">
                <div class="form-group">
                    <label for="inputName">System Name</label>
                    <input type="text" class="form-control" id="inputName" placeholder="Name" ng-model="$ctrl.ogDevice.name">
                </div>
                <!--<div class="form-group">-->
                    <!--<label for="inputLocation">Location in Venue</label>-->
                    <!--<input type="text" class="form-control" id="inputLocation" placeholder="Location"-->
                           <!--ng-model="system.locationWithinVenue">-->
                <!--</div>-->

            </form>
            <a class="btn btn-warning" style="width: 100%;" ng-click="$ctrl.updateSystemName()">UPDATE</a>
            <p>&nbsp;</p>
            <!--<a class="btn btn-danger" style="width: 100%; margin-top: 10px;" ui-sref="register">-->
                <!--REGISTER WITH VENUE-->
            <!--</a>-->
            
            <h3>BETA SOFFTWARE</h3>
            <p>You are currently using the latest beta version of the Ourglass Control App. If you would like to switch to the old version, click below.</p>
            <p class="btn btn-danger" style="width: 100%;" ng-click="$ctrl.abandonBeta()">SWITCH BACK TO OLD VERSION</p>

        </div>

    </div>

</div>

`
};

export default Component


