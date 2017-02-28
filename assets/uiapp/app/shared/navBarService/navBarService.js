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
                    label: "Devices", //might need to be modified
                    id: "devices",
                    items: [{label: "All Devices", link: {type: 'ui-sref', addr: 'device.adminList'}}
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
            },
            'proprietor.owner': {
                left: [{
                    label: 'Managers',
                    id: 'managers',
                    items: [{label: "Managers", link: {type: 'ui-sref', addr: 'user.managerList'}}
                    ]
                },
                    {
                        label: "Devices", //might need to be modified
                        id: "devices",
                        items: [{label: "Owned Devices", link: {type: 'ui-sref', addr: 'device.list'}}
                        ]
                    },
                    {
                        label: "Venues",
                        id: "venues",
                        items: [{label: "My Venues", link: {type: 'ui-sref', addr: 'venue.list'}}]
                    },
                    /* {
                     label: "Organization",
                     id: "organization",
                     items: [{label: "organization", link: {type: 'ui-sref', addr: 'organization.view'}}]
                     }*/
                ],
                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
            },
            'proprietor.manager': {
                left: [
                    // {
                    // label: 'Users',
                    // id: 'users',
                    // items: [{label: "Manage Users", link: {type: 'ui-sref', addr: 'admin.manageUsers'}},
                    //     {label: "Add User", link: {type: 'ui-sref', addr: 'admin.addUser'}}
                    // ]
                    // },
                    {
                        label: "Devices", //might need to be modified
                        id: "devices",
                        items: [{label: "Managed Devices", link: {type: 'ui-sref', addr: 'device.managerList'}}]
                    },
                    /*{
                     label: "Organization",
                     id: "organization",
                     items: [{
                     label: "organization",
                     link: {type: 'ui-sref', addr: 'organization.view'}
                     }]
                     }*/
                ],
                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
            },
            'user': {
                left: [
                    /*{
                     label: 'Register a Device',
                     id: 'device',
                     items: [{label: "device", link: {type: 'ui-sref', addr: 'device.add'}}]

                     }*/
                    /*{
                     label: 'Me',
                     id: "user",
                     items: [{
                     label: 'me', link: {type: 'ui-sref', addr: 'user.editUser'}
                     }
                     ]
                     },
                     {
                     label: 'Check Ins',
                     id: "checkins",
                     items: [{
                     label: 'Check Ins', link: {type: 'href', addr: '#'}
                     }]
                     }
                     */],
                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
            },
            'developer': {
                left: {}
                ,

                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
            },
            'sponsor': {
                left: [
                    {
                        label: 'Sponsorships',
                        id: "ads",
                        items: [
                            {
                                label: 'My Sponsorships', link: {type: 'ui-sref', addr: 'sponsorship.list'}
                            }
                        ]
                    }]
                ,

                right: [{
                    label: 'Account',
                    id: 'account',
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
            },
            'example': { //examples for types of tabs
                left: [
                    {
                        label: 'Link1', //duplicate single link
                        id: "link1",
                        items: [{
                            label: 'Link1', link: {type: 'href', addr: '#'}
                        }
                        ]
                    },

                    {
                        label: 'Single Link',
                        id: 'singleLink', //must have a one word id for bootstrap purposes
                        items: [ //list the single item in the list
                            {
                                label: 'ignored key, not required', link: {type: 'href', addr: "#"}
                            }
                        ]
                    }, {
                        label: 'Dropdown', //a dropdown with multiple links
                        id: "dropdown",
                        items: [
                            {
                                label: "Manage Users",
                                link: {type: 'ui-sref', addr: 'admin.manageUsers'}
                            },
                            {
                                label: "Add User",
                                link: {type: 'ui-sref', addr: 'admin.addUser'}
                            }
                        ]
                    }
                ],
                right: [{
                    label: 'Account', //similar to above, shows no repeats and dropdown combinations
                    id: "account", //duplicate dropdown
                    items: [{
                        label: "Edit My Account",
                        link: {type: 'ui-sref', addr: 'user.editUser'}
                    },
                        {
                            label: "Logout", link: {type: 'href', addr: '/logout'}
                        },
                        { //for testing purposes :)
                            label: "log me out", link: {type: 'href', addr: '/logout'}
                        }
                    ]
                }]
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
