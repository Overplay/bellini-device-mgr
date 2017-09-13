/**
 * Created by mkahn on 9/13/17.
 */

app.component( 'maintComponent', {

    bindings:   {
    },
    controller: function ( toastr, $log, sailsOGDevice, $q ) {

        var ctrl = this;

        ctrl.daysStale = 7;

        ctrl.loadStaleDevices = function(){
            sailsOGDevice.getStale( ctrl.daysStale )
                .then( function ( devices ) {
                    ctrl.stale = devices;
                } )
                .catch( function ( err ) {
                    toastr.error( "Bad Mojo Getting Stale Boxes!" );
                } );
        };

        ctrl.nukeStale = function(){

            let deathPile = ctrl.stale.map((d) => d.delete());
            $q.all(deathPile)
                .then( function(){
                    toastr.success(deathPile.length + " devices deleted");
                })
                .catch( function(){
                    toastr.error("Something bad happened deleting");
                })
                .finally(ctrl.loadStaleDevices);


        }

        ctrl.$onInit = function () {

        };

        this.loadStaleDevices();




    },

    template: `

<div class="container">
    <div class="row top15">

        <div class="col-sm-10 material-panel">
            <h1><i class="fa fa-tachometer" aria-hidden="true" style="color: #999999"></i>&nbsp;Recommended Maintenace</h1>

            <h3>Ghost Devices</h3>
            <div class="row" style="background-color: #efefef; padding: 5px;">
                <div class="col-sm-2">Days MIA</div>
                <div class="col-sm-6">
                     <div class="form-group">
                        <input type="text" class="form-control" id="days" ng-model="$ctrl.daysStale">
                     </div>
                </div>
                <div class="col-sm-3">
                    <button class="btn btn-primary" ng-click="$ctrl.loadStaleDevices()">REFRESH</button>
               </div>
            </div>
            
            <p ng-if="$ctrl.stale.length" class="text-muted">These are devices that have not been heard from in a long time and are probably stale (i.e. the UDID is no longer valid), or are disabled/turned off.</p>
            <ul><li ng-repeat="d in $ctrl.stale">{{d.deviceUDID}}</li> </ul>
            <button ng-if="$ctrl.stale.length" ng-click="$ctrl.nukeStale()" class="btn btn-danger">NUKE ALL</button>
            <p class="text-muted" ng-if="!$ctrl.stale.length">There are no ghost devices. Yay!</p>
        </div>
    </div>
</div>

`});