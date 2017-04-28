/**
 * Created by mkahn on 4/24/17.
 */

app.component( 'userBasicInfo', {

    bindings:   {
        user: '='
    },
    controller: function ( uibHelper, toastr, $log ) {

        var ctrl = this;

        ctrl.changeEmail = function () {
            $log.debug( 'Changing email...' )
            uibHelper.headsupModal( 'Not Implemented', 'Changing email address for an account is not implemented yet. Sorry!' )
                .then( function () {} );
        };

        ctrl.changeName = function () {
            $log.debug( 'Changing name...' );

            var fields = [
                {
                    label:       "First Name",
                    placeholder: "first name",
                    type:        'text',
                    field:       'firstName',
                    value:       ctrl.user.firstName
                },
                {
                    label:       "Last Name",
                    placeholder: "last name",
                    type:        'text',
                    field:       'lastName',
                    value:       ctrl.user.lastName
                }

            ];

            uibHelper.inputBoxesModal( "Edit Name", "", fields )
                .then( function ( fields ) {
                    $log.debug( fields );
                    ctrl.user.firstName = fields.firstName;
                    ctrl.user.lastName = fields.lastName;
                    ctrl.user.save()
                        .then( function () {
                            toastr.success( "Name changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing name!" );
                        } );
                } );

        };

        this.changePhone = function () {
            $log.debug( 'Changing phone...' );

            uibHelper.stringEditModal( 'Change Phone Number', '', ctrl.user.mobilePhone )
                .then( function ( phone ) {
                    ctrl.user.mobilePhone = phone;
                    ctrl.user.save()
                        .then( function () {
                            toastr.success( "Phone number changed" );
                        } )
                        .catch( function () {
                            toastr.error( "Problem changing phone number!" );
                        } );
                } )
        };


    },

    template: `<table class="table table-striped table-bordered top15">
                            <tbody>
                            <tr>
                                <td>Email</td>
                                <td>{{ $ctrl.user.email }}
                                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true" ng-click="$ctrl.changeEmail()"></i>
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{{ $ctrl.user.firstName }}&nbsp;{{ $ctrl.user.lastName }}
                                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                                       ng-click="$ctrl.changeName()"></i>
                                </td>
                            </tr>
                            <tr>
                                <td>Mobile #</td>
                                <td>{{ $ctrl.user.mobilePhone }}
                                    <i class="fa fa-pencil-square-o ibut pull-right" aria-hidden="true"
                                       ng-click="$ctrl.changePhone()"></i>
                                </td>
                            </tr>
                            <tr>
                                <td>Registered On</td>
                                <td>{{ $ctrl.user.createdAt | date }}</td>
                            </tr>
                            </tbody>
                        </table>`


} );