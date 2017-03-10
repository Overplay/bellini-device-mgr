/**
 * Created by cgrigsby on 5/9/16.
 */
app.factory('navBarService', function ($log) {
    "use strict";

    var service = {};
    var _navBarMenus = {

            'admin': {
                left: [{
                    label: 'Users',
                    id: 'users',
                    items: [{label: "Users", link: {type: 'ui-sref', addr: 'user.adminList'}}
                    ]
                }, {
                    label: "OGDevices", //might need to be modified
                    id: "devices",
                    items: [{label: "All OGDevices", link: {type: 'ui-sref', addr: 'ogdevice.list'}}
                    ]
                },
                    /*{
                     label: "Organization",
                     id: "organization",
                     items: [{label: "organization", link: {type: 'ui-sref', addr: 'organization.view'}}]
                     },*/
                    {
                        label: "Venues",
                        id: "venues",
                        items: [{label: "All Venues", link: {type: 'ui-sref', addr: 'venue.adminList'}}]
                    },
                    {
                        label: "Sponsorships",
                        id: "trevda",
                        items: [{label: "All Sponsorships", link: {type: 'ui-sref', addr: 'sponsorship.adminList'}}]
                    },
                    {
                        label: "Best Position",
                        id: "bestposition",
                        items: [{label: "Best Position", link: {type: 'ui-sref', addr: 'bestposition.list'}}]
                    }
                ],
                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{label: "Edit My Account", link: {type: 'ui-sref', addr: 'user.editUser'}},
                        {label: "Logout", link: {type: 'href', addr: '/logout'}}
                    ]
                }
                ]
            }
        }
        ;


    service.getMenuForRoles = function (r) {
        //init menus so that it can be merged with
        var menus = {};
        var roles = r || nucleus.roles;

        //helper method to combine arrays within the object
        //basically it prevents duplicate tabs and combines sub links
        function mergeHelper(objValue, srcValue) {

            //combine any dropdowns with the same label
            _.forEach(objValue, function (val) {
                var match;

                if (match = _.find(srcValue, {label: val.label})) {
                    val.items = match.items = _.unionWith(val.items, match.items, function (obj1, obj2) {
                        if (obj1.label == obj2.label) {
                            return true;
                        }
                    });
                    val.id = match.id = val.id; //fix not matched IDs
                }
            });


            if (_.isArray(objValue)) {
                //concat but prevent duplicate tab items (like Account)
                return _.unionWith(objValue, srcValue, _.isEqual);
            }
        }

        // step through all the roles and append them to the nav bar
        // order of tabs for multiple roles??

        roles.forEach(function (val) {
            menus = _.mergeWith(menus, _navBarMenus[val], mergeHelper);
            
        });

        return menus;
    };


    return service;
})
;
