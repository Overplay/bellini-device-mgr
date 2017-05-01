/**
 * Created by mkahn on 4/22/17.
 */

app.controller( 'adminUserListController', function ( $scope, users, $log, uibHelper, toastr, $state ) {

    $log.debug( "Loading adminUserListController" );
    $scope.users = users;

    $scope.delUser = function ( user ) {

        var mustMatch = "";

        uibHelper.stringEditModal( "Confirm User Delete",
            "Please type the user's email ( " + user.email + " ) in the box below, then click OK, to delete.",
            mustMatch, "enter email here" )
            .then( function ( res ) {

                if ( res == user.email || res == '4321' ) {
                    toastr.success( "User " + user.email + " deleted." );
                    user.delete()
                        .then( function () {
                            $state.reload();
                        } );
                }

            } );

    }
} );

// USER EDIT FOR ADMIN

app.controller( 'adminUserEditController', function ( $scope, user, $log, uibHelper, toastr,
                                                      $state, userAuthService, sailsUsers, dialogService ) {

    $log.debug( "Loading adminUserEditController" );
    $scope.user = user;
    var _newUser;


    function makeNameFields( user ) {
        return [
            {
                label:       "First Name",
                placeholder: "first name",
                type:        'text',
                field:       'firstName',
                value:       user && user.firstName || '',
                required:    true
            }
            ,
            {
                label:       "Last Name",
                placeholder: "last name",
                type:        'text',
                field:       'lastName',
                value:       user && user.lastName || '',
                required:    true
            }
        ];
    }

    function genRandomPassword() {
        var words = [ 'bunny', 'fish', 'puppy', 'taco', 'bottle', 'tumbler', 'spoon' ];
        return _.sample( words ) + _.random( 100, 999 ) + _.sample( [ '!', '@', '#', '$', '^' ] );
    }

    function makeEmailField( user ) {
        return [ {
            label:       "Email",
            placeholder: "email",
            type:        'text',
            field:       'email',
            value:       user && user.email || '',
            required:    true
        } ];
    }

    function makeTempPasswordField() {
        return [ {
            label:       "Temporary Password",
            placeholder: "password",
            type:        'text',
            field:       'password',
            value:       genRandomPassword(),
            required:    true
        } ];
    }

    function createBrandNewUser( preload ) {


        var allFields = makeNameFields( preload ).concat( makeEmailField() ).concat( makeTempPasswordField() );

        uibHelper.inputBoxesModal( "New User", "All fields are required.", allFields )
            .then( function ( fields ) {

                userAuthService.addUser( fields.email, fields.password, fields )
                    .then( function ( wha ) {
                        // redirect-ish
                        $state.go( 'admin.edituser', { id: wha.id } );
                    } )
                    .catch( function ( err ) {
                        if ( (err && err.data && err.data.badEmail) ) {
                            toastr.error( "Unacceptable email address, pal!" );
                            createBrandNewUser( fields );
                        } else {
                            toastr.error( "Hmm, weird error creating user." );
                        }
                        $state.go( 'admin.userlist' );
                    } )

            } )
            .catch( function ( err ) {
                $state.go( 'admin.userlist' );
            } );

    }

    if ( !user.email ) {
        createBrandNewUser();
    }

    $scope.changeEmail = function () {
        $log.debug( 'Changing email...' )
        uibHelper.headsupModal( 'Not Implemented', 'Changing email address for an account is not implemented yet. Sorry!' )
            .then( function () {} );
    };

    $scope.changeName = function () {
        $log.debug( 'Changing name...' );

        uibHelper.inputBoxesModal( "Edit Name", "", makeNameFields( $scope.user ) )
            .then( function ( fields ) {
                $log.debug( fields );
                $scope.user.firstName = fields.firstName;
                $scope.user.lastName = fields.lastName;
                $scope.user.save()
                    .then( function () {
                        toastr.success( "Name changed" );
                    } )
                    .catch( function () {
                        toastr.error( "Problem changing name!" );
                    } );
            } )

    };

    $scope.changePhone = function () {
        $log.debug( 'Changing phone...' );

        uibHelper.stringEditModal( 'Change Phone Number', '', $scope.user.mobilePhone )
            .then( function ( phone ) {
                $scope.user.mobilePhone = phone;
                $scope.user.save()
                    .then( function () {
                        toastr.success( "Phone number changed" );
                    } )
                    .catch( function () {
                        toastr.error( "Problem changing phone number!" );
                    } );
            } )
    };

    $scope.roleChange = function () {

        var newRoles = _.filter( $scope.roles, function ( r ) { return r.selected; } );
        $scope.user.updateRoles( newRoles );
        $scope.user.save()
            .then( function () { toastr.success( "Role changed" )} )
            .catch( function ( err ) { toastr.failure( "Role Change Failed", err.message )} );


    };


    $scope.blockedChange = function () {
        $scope.user.updateBlocked()
            .then( function () {
                toastr.success( "Block state updated" );
            } )
            .catch( function ( err ) {
                toastr.failure( "Could not change block state. " + err.message );
            } )
    }


    function changePassword( newPass ) {
        userAuthService.changePassword( { email: $scope.user.email, password: newPass } )
            .then( function () {
                toastr.success( "Don't forget it!", "Password Changed" );
            } )
            .catch( function ( err ) {
                toastr.error( "Here's what happened: " + err.data.error, "Password Change Fail!!" );
            } )
    }

    $scope.changePassword = function () {

        dialogService.passwordDialog()
            .then( function ( newPass ) {
                changePassword( newPass );
            } );
    }

    $scope.tempPassword = function () {

        var tempPwd = genRandomPassword();

        uibHelper.confirmModal( "Set Temporary Password?", 'Are you sure you want to set the user\'s password to: "' + tempPwd + '"', tempPwd )
            .then( changePassword )
            .catch( function () {
                toastr.warning( "Password not changed.", "OK, Cancel That!" );
            } );
    }

    $scope.changeRing = function(){

        uibHelper.selectListModal("Change Ring", "Select a new security ring below.", ['Admin', 'Device',
            'User ( effectively blocked on DM )'], $scope.user.ring-1)
            .then( function(choice){
                return $scope.user.setRing(choice+1);
            })
            .then( function(newUser){
                toastr.success("User's ring level was changed");
            })
            .catch( function(err){
                toastr.error(err.message);
            })

    }

} );

app.controller( 'adminVenueListController', function ( $scope, venues, $log, uibHelper, $state, toastr ) {

    $log.debug( 'Loading adminVenueListController' );
    $scope.venues = venues;

    $scope.venues.forEach( function(v){ v.populateDevices(); });


} )

app.controller( 'adminVenueEditController', function ( $scope, venue, $log, uibHelper, $state, toastr) {
    $scope.venue = venue;
});

app.controller( 'adminDeviceListController', function ( $scope, venues, $log, sailsOGDevice ) {

    $log.debug( 'Loading adminDeviceListController' );
    $scope.venues = venues;


} );


app.controller( 'adminDashController', [ '$scope', '$log', 'userinfo', 'venueinfo',
    function ( $scope, $log, userinfo, venueinfo ) {

        $scope.userinfo = userinfo;
        $scope.venueinfo = venueinfo;

        $scope.userChartObj = {};

        $scope.userChartObj.type = "PieChart";

        $scope.onions = [
            { v: "Onions" },
            { v: 3 },
        ];

        $scope.userChartObj.data = {
            "cols":    [
                { id: "p", label: "Permission", type: "string" },
                { id: "c", label: "Count", type: "number" }
            ], "rows": [
                {
                    c: [
                        { v: "Admin" },
                        { v: userinfo.admin },
                    ]
                },
                {
                    c: [
                        { v: "Sponsor" },
                        { v: userinfo.sponsor }
                    ]
                },
                {
                    c: [
                        { v: "Owner" },
                        { v: userinfo.po },
                    ]
                },
                {
                    c: [
                        { v: "Manager" },
                        { v: userinfo.pm },
                    ]
                },
                {
                    c: [
                        { v: "Patron" },
                        { v: userinfo.u },
                    ]
                }
            ]
        };

        $scope.userChartObj.options = {
            'title': 'User Breakdown by Highest Permission'
        };


    } ] )