/**
 * Created by ryanhartzell on 4/25/17.
 */

app.component( 'venueBasicInfo', {

    bindings:   {
        venue: '='
    },
    controller: function ( uibHelper, toastr, $log ) {

        var ctrl = this;

        ctrl.changeName = function () {
            $log.debug( 'Changing name...' );

            var fields = [
                {
                    label:       "Venue Name",
                    placeholder: "venue name",
                    type:        'text',
                    field:       'name',
                    value:       ctrl.venue.name
                }

            ];

            uibHelper.inputBoxesModal( "Edit Name", "", fields )
                .then( function ( fields ) {
                    $log.debug( fields );
                    ctrl.venue.name = fields.name;
                    ctrl.venue.save()
                        .then( function () {
                            toastr.success( "Name changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing name!" );
                        } );
                } );

        };

        this.changeAddress = function () {
            $log.debug( 'Changing address...' );
            var fields = [
                {
                    label:       "Street Address",
                    placeholder: "street address",
                    type:        'text',
                    field:       'street',
                    value:       ctrl.venue.address.street
                },
                {
                    label:       "Address Line 2",
                    placeholder: "address line 2",
                    type:        'text',
                    field:       'street2',
                    value:       ctrl.venue.address.street2
                },
                {
                    label:       "City",
                    placeholder: "city",
                    type:        'text',
                    field:       'city',
                    value:       ctrl.venue.address.city
                },
                {
                    label:       "State",
                    placeholder: "state",
                    type:        'text',
                    field:       'state',
                    value:       ctrl.venue.address.state
                },
                {
                    label:       "ZIP Code",
                    placeholder: "ZIP code",
                    type:        'text',
                    field:       'zip',
                    value:       ctrl.venue.address.zip
                }

            ];

            uibHelper.inputBoxesModal( 'Change Venue Address', '', fields)
                .then( function ( fields ) {
                    ctrl.venue.address.street = fields.street;
                    ctrl.venue.address.street2 = fields.street2;
                    ctrl.venue.address.city = fields.city;
                    ctrl.venue.address.state = fields.state;
                    ctrl.venue.address.zip = fields.zip;

                    ctrl.venue.save()
                        .then( function () {
                            toastr.success( "Address changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing address!" );
                        } );
                } )
        };


    },

    template: `<table class="table table-striped table-bordered top15">
                            <tbody>
                            <tr>
                                <td>Name</td>
                                <td>{{ $ctrl.venue.name }}
                                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                                       ng-click="$ctrl.changeName()"></i>
                                </td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>{{ $ctrl.venue.addressString() }}    
                                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                                       ng-click="$ctrl.changeAddress()"></i>
                                </td>
                            </tr>
                            <tr>
                                <td>Registered On</td>
                                <td>{{ $ctrl.venue.createdAt | date : "MMMM d, yyyy" }}</td>
                            </tr>
                            </tbody>
                        </table>`


} );