/**
 * Created by mkahn on 4/26/17.
 */

app.component( 'venueDeviceList', {

    bindings:   {
        venue: '='
    },
    controller: function ( sailsOGDevice, $log ) {

        var ctrl = this;

        this.$onInit =  function () {
            ctrl.venue.populateDevices()
                .then( function ( populated ) {
                    ctrl.venue = populated;
                } )
        }

    },


    template: `<div class="ogcard">
        <div class="venueside">
            {{ $ctrl.venue.name }}
        </div>
        <div class="devside">
        
       Devices
       
       </div>
       </div>
        
        `


} );