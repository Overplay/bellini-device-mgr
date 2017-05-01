/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'ringBadge', {

    bindings:   {
        ring: '<'
    },
    controller: function () {

        var ctrl = this;

        ctrl.ringbadge = {};

        function update(){

            switch ( ctrl.ring ) {

                case 1:
                    ctrl.ringbadge = { color: 'admin', label: 'Admin/1' };
                    break;

                case 2:
                    ctrl.ringbadge = { color: 'device', label: 'Device/2' };
                    break;

                case 3:
                    ctrl.ringbadge = { color: 'user', label: 'User/3' };
                    break;

                case 4:
                    ctrl.ringbadge = { color: 'sponsor', label: 'Sponsor/4' };
                    break;

            }

        }

        ctrl.$onChanges = update;


    },

    template: '<span class="ring-badge" ng-class="$ctrl.ringbadge.color">{{ $ctrl.ringbadge.label }}</span>'

} );