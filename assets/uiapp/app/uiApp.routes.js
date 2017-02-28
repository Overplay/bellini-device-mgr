/**
 * Created by mkahn on 4/6/16.
 */

app.config(function ($stateProvider, $urlRouterProvider) {

    console.debug("Loading routes");

    var apiPath = 'api/v1';

    $urlRouterProvider.otherwise('/dash');

    $stateProvider

        .state( 'socket', {
                url: '/socket',
                templateUrl: '/uiapp/app/components/socket/socket.partial.html',
                controller:  'socketController'
            }
        )
                             
        .state('user.adminList', {
            url: '/admin-list',
            data: {subTitle: "Manage Users"},
            controller: 'listUserController',
            templateUrl: '/uiapp/app/components/user/userlist.partial.html',
            resolve: {
                users: function (nucleus) {
                    return nucleus.getAuth()
                },
                role: function () {
                    return "admin";
                },
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }

        })

        .state('user', {
            url: '/user',
            templateUrl: '/uiapp/app/components/user/user-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true
        })

        .state('user.addUser', {
            url: '/add-user',
            data: {subTitle: "Add User"},
            controller: "addUserController",
            templateUrl: '/uiapp/app/components/user/add-user-admin.partial.html',
            resolve: {
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }

        })

        .state('user.managerList', {
            url: '/managers',
            controller: 'listUserController',
            templateUrl: 'uiapp/app/components/user/userlist.partial.html',
            resolve: {
                users: function ($http, $q, nucleus) {
                    var managerUsers = [];
                    var managerAuths = [];

                    return $http.get('/user/getVenues')
                        .then(function (data) {
                            return data.data;
                        })
                        .then(function (venues) {
                            var all = [];
                            angular.forEach(venues, function (venue) {
                                all.push($http.get('/venue/getVenueManagers', {params: {id: venue.id}})
                                    .then(function (data) {
                                        angular.forEach(data.data, function (manager) {
                                            var i;
                                            if ((i = _.findIndex(managerUsers, function (o) {
                                                    return o.id === manager.id
                                                })) === -1) {
                                                manager.managedVenues = [venue];
                                                managerUsers.push(manager);
                                            }
                                            else
                                                managerUsers[i].managedVenues.push(venue);

                                        })
                                    }));
                            });

                            return $q.all(all);
                        })
                        .then(function () { //do all this backend?? 
                            var all = []; //necesary because it doesnt deep populate 
                            angular.forEach(managerUsers, function (manager) {
                                all.push(nucleus.getAuth(manager.auth)
                                    .then(function (data) {
                                        data.user = manager;
                                        managerAuths.push(data);
                                    }))
                            });
                            return $q.all(all);
                        })
                        .then(function () {
                            return managerAuths;
                        })
                },
                links: function () {
                    return [
                        {text: "Managers", link: "user.managerList"}
                    ]
                },
                role: function () {
                    return "manager";
                }
            }

        })

        .state('user.editUser', {
            url: '/edit-user/:id',
            data: {subTitle: "Edit User"},
            controller: 'editUserController',
            templateUrl: '/uiapp/app/components/user/edit-user.partial.html',
            resolve: {
                user: function (nucleus) { //TODO this is broken
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "Back to Dash", link: "dash"}
                    ]
                }
            }
        })

        .state('user.editUserOwner', {
            url: '/edit-user-owner/:id',
            controller: 'editUserOwnerController',
            templateUrl: '/uiapp/app/components/user/edit-user-admin.partial.html',
            resolve: {
                user: function (nucleus, $stateParams) {
                    return nucleus.getAuth($stateParams.id)
                        .then(function (auth) {
                            return nucleus.getUser(auth.user.id)
                                .then(function (user) {
                                    auth.user = user;
                                    return auth;
                                })
                        })
                        .then(function (auth) {
                            return nucleus.getMe()
                                .then(function (me) {
                                    return nucleus.getUser(me.id);
                                })
                                .then(function (user) {
                                    auth.user.managedVenues = _.intersectionWith(user.ownedVenues, auth.user.managedVenues,
                                        function (v1, v2) {
                                            return v1.id === v2.id;
                                        })
                                    return auth;
                                })
                        })
                },
                owned: function (nucleus) {
                    return nucleus.getMe()
                        .then(function (me) {
                            return nucleus.getUser(me.id)
                                .then(function (user) {
                                    return user.ownedVenues;
                                })
                        })
                },
                links: function () {
                    return [
                        {text: "Managers", link: "user.managerList"}
                    ]
                }
            }
        })

        .state('user.editUserAdmin', {
            url: '/edit-user-admin/:id',
            data: {subTitle: "Edit User (Admin)"},
            controller: 'editUserAdminController',
            templateUrl: '/uiapp/app/components/user/edit-user-admin.partial.html',
            resolve: {
                user: function (nucleus, $stateParams) {
                    return nucleus.getAuth($stateParams.id)
                        .then(function (auth) {
                            return nucleus.getUser(auth.user.id)
                                .then(function (user) {
                                    auth.user = user;
                                    return auth;
                                })
                        })
                },
                roles: function (nucleus) {
                    return nucleus.getRole()
                },
                links: function () {
                    return [
                        {text: "All Users", link: "user.adminList"},
                        {text: "Add User", link: "user.addUser"}
                    ]
                }
            }
        })

        // New Venue Routes

        .state('venue', {
            url: '/venue',
            templateUrl: '/uiapp/app/components/venue/venue-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true
        })

        .state('venue.view', {
            url: '/view/:id',
            resolve: {
                venue: function ($http, $stateParams) {
                    return $http.get(apiPath + "/venue/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                user: function (nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                role: function () {
                    return "owner";
                }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller: 'viewVenueController'
        })

        .state('venue.adminView', {
            url: '/admin-view/:id',
            resolve: {
                venue: function ($http, $stateParams) {
                    return $http.get(apiPath + "/venue/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                user: function (nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                role: function () {
                    return "admin";
                }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller: 'viewVenueController'
        })

        .state('venue.edit', {
            url: '/edit/:id',
            resolve: {

                venue: function ($http, $stateParams) {
                    return $http.get(apiPath + "/venue/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                edit: function () {
                    return true;
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                role: function () {
                    return "owner";
                }
            },
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController'
        })

        .state('venue.adminEdit', {
            url: '/admin-edit/:id',
            resolve: {

                venue: function ($http, $stateParams) {
                    return $http.get(apiPath + "/venue/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                edit: function () {
                    return true;
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                role: function () {
                    return "admin";
                }
            },
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController'
        })


        .state('venue.list', {
            url: '/list',
            controller: 'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve: {
                venues: function ($http) {
                    return $http.get('/user/getVenues')
                        .then(function (data) {
                            return data.data;
                        })
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                role: function () {
                    return "owner";
                }
            }
        })

        .state('venue.adminList', {
            url: '/admin-list',
            controller: 'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve: {
                venues: function ($http) {
                    return $http.get(apiPath + '/venue')
                        .then(function (data) {
                            return data.data;
                        })
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                role: function () {
                    return "admin";
                }
            }
        })

        .state('venue.add', {
            url: '/add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function () {
                    return false;
                },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "My Venues", link: "venue.list"},
                        {text: "Add Venue", link: "venue.add"}
                    ]
                },
                role: function () {
                    return "owner";
                }
            }
        })

        .state('venue.adminAdd', {
            url: '/admin-add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function () {
                    return false;
                },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "All Venues", link: "venue.adminList"},
                        {text: "Add Venue", link: "venue.adminAdd"}
                    ]
                },
                role: function () {
                    return "admin";
                }
            }
        })

        .state('venue.userAdd', {
            url: '/user-add',
            templateUrl: '/uiapp/app/components/venue/addeditvenue.partial.html',
            controller: 'addEditVenueController',
            resolve: {
                edit: function () {
                    return false;
                },
                venue: function () {
                    return null;
                },
                links: function () {
                    return [
                        {text: "Back to Dash", link: "dash"}
                    ]
                },
                role: function () {
                    return "user";
                }
            }
        })

        .state('bestposition', {
            url: '/bestposition',
            templateUrl: '/uiapp/app/components/bestposition/bestposition-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true
        })

        .state('bestposition.list', {
            url: '/list',
            templateUrl: '/uiapp/app/components/bestposition/bestpositionlist.partial.html',
            controller: 'bestPositionListController',
            resolve: {
                links: function () {
                    return [
                        {link: 'bestposition.list', text: "All Models"}
                    ]
                },
               /* 
                models: function ($http) {
                    return $http.get('http://'+url+':1338/BestPosition/findAll')
                        .then( function (data) {
                            return data.data
                        })
                }*/
            }
        })
        .state('bestposition.edit', {
            url: '/edit/:id',
            templateUrl: '/uiapp/app/components/bestposition/bestposition-edit.partial.html',
            controller: 'bestPositionEditController',
            params: {
                url: {
                    value: ""
                }
            },
            resolve: {
                links: function () {
                    return [
                        {link: 'bestposition.list', text: "All Models"}
                    ]
                },
                //TODO url and edit page (save function
                model: function ($http, $stateParams) {
                    return $http.get('http://'+$stateParams.url+'/BestPosition/'+$stateParams.id)
                        .then( function (data) {
                            return data.data
                        })
                }
            }
        })
        .state('bestposition.multiEdit', {
            url: '/multi-edit/',
            templateUrl: '/uiapp/app/components/bestposition/bestposition-multiedit.partial.html',
            controller: 'bestPositionMultiEditController',
            params: {
                ids: {
                    value: [],
                    array: true
                }
            },
            resolve: {
                links: function () {
                    return [
                        {link: 'bestposition.list', text: "All Models"}
                    ]
                },
                ids: function ($http, $stateParams) {
                    return $stateParams.ids;
                }
            }
        })

        .state('device', {
            url: '/device',
            templateUrl: '/uiapp/app/components/device/device-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true
        })

        .state('device.list', {
            url: '/list',
            controller: 'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve: {
                devices: function ($http) {
                    return $http.get('/user/getDevices')
                        .then(function (data) {
                            return data.data;
                        })
                },
                role: function () {
                    return "owner";
                },
                links: function () {
                    return [
                        {link: 'device.list', text: "My Devices"},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.managerList', {
            url: '/manager-list',
            controller: 'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve: {
                devices: function ($http) {
                    return $http.get('/user/getManagedDevices')
                        .then(function (data) {
                            return data.data;
                        })
                },
                role: function () {
                    return "manager";
                },
                links: function () {
                    return [
                        {link: 'device.managerList', text: "Managed Devices"},
                        // {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.adminList', {
            url: '/admin-list',
            controller: 'listDeviceController',
            templateUrl: '/uiapp/app/components/device/devicelist.partial.html',
            resolve: {
                devices: function ($http) {
                    return $http.get(apiPath + '/device')
                        .then(function (data) {
                            return data.data;
                        })
                },
                role: function () {
                    return "admin";
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.userAdd', {
            url: '/user-activate',
            data: {subTitle: "Add a Device"},
            controller: 'addDeviceController',
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve: {
                links: function () {
                    return [
                        {link: 'dash', text: 'Back to Dash'}
                    ]
                },
                user: function (nucleus) {
                    return nucleus.getMe()
                    // .then( function (me) {
                    //     return nucleus.getUser(me.id);
                    // });
                }
            }

        })

        .state('device.add', {
            url: '/activate',
            data: {subTitle: "Add a Device"},
            controller: "addDeviceController",
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.list', text: 'My Devices'},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.adminAdd', {
            url: '/activate-admin',
            data: {subTitle: "Add a Device"},
            controller: "addDeviceAdminController",
            templateUrl: '/uiapp/app/components/device/add-device.partial.html',
            resolve: {
                venues: function ($http) {
                    return $http.get(apiPath + '/venue')
                        .then(function (data) {
                            return data.data;
                        });
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.register', {
            url: '/register',
            data: {subTitle: "Register a Device"},
            // controller:  "registerDeviceController",
            templateUrl: '/uiapp/app/components/device/register-device.partial.html'
        })

        .state('device.adminManage', {
            url: '/admin-manage/:id',
            data: {subTitle: "Manage Device"},
            controller: 'editDeviceAdminController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve: {
                device: function ($http, $stateParams) {
                    return $http.get(apiPath + "/device/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                },
                edit: function () {
                    return true
                },
                venues: function ($http) {
                    return $http.get(apiPath + '/venue')
                        .then(function (data) {
                            return data.data;
                        })
                },
                links: function () {
                    return [
                        {link: 'device.adminList', text: 'All Devices'},
                        {link: 'device.adminAdd', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.ownerManage', {
            url: '/owner-manage/:id',
            data: {subTitle: "Manage Device"},
            controller: 'editDeviceOwnerController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve: {
                device: function ($http, $stateParams) {
                    return $http.get(apiPath + "/device/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                edit: function () {
                    return true
                },
                user: function (nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.list', text: 'My Devices'},
                        {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('device.managerManage', {
            url: '/manager-manage/:id',
            data: {subTitle: "Manage Device"},
            controller: 'editDeviceOwnerController',
            templateUrl: '/uiapp/app/components/device/manage-device.partial.html',
            resolve: {
                device: function ($http, $stateParams) {
                    return $http.get(apiPath + "/device/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                        .catch(function (err) {
                            return err;
                        })
                },
                edit: function () {
                    return false
                },
                user: function (nucleus) {
                    return nucleus.getMe()
                },
                links: function () {
                    return [
                        {link: 'device.managerList', text: 'Managed Devices'},
                        // {link: 'device.add', text: 'Add Device'}
                    ]
                }
            }
        })

        .state('organization', {
            url: '/organization',
            templateUrl: '/uiapp/app/components/organization/organization-sidemenu.partial.html',
            abstract: true,
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe()
                }
            }
        })

        .state('organization.edit', {
            url: '/edit',
            resolve: {},
            templateUrl: '/uiapp/app/components/organization/edit-organization.partial.html',
            controller: 'editOrganizationController'
        })

        .state('organization.manage', {
            url: '/manage',
            data: {subTitle: "Manage Organization"},
            controller: 'editOrganizationController',
            templateUrl: '/uiapp/app/components/organization/manage-organization.partial.html',
            /*resolve: { not really necesary unless someone has control of multiple organizations?
             organization: function($http, $stateParams){
             $http.get("api/v1/organization/" + $stateParams.id)
             .then(function (data) {
             return data.data;
             })
             }
             }*/
        })

        .state('organization.view', {
            url: '/view',
            data: {subTitle: "View Organization"},
            controller: 'viewOrganizationController',
            templateUrl: '/uiapp/app/components/organization/view-organization.partial.html',
            resolve: {
                organization: function ($http, $stateParams) {

                    $http.get("api/v1/organization/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                }
            }
        })


        .state('sponsorship', {
            url: '/sponsorship',
            templateUrl: '/uiapp/app/components/trevda/trevda-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true,
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                }
            }
        })

        .state('sponsorship.add', {
            url: '/add',
            templateUrl: '/uiapp/app/components/trevda/add-trevda.partial.html',
            data: {subTitle: "Add Sponsorship"},
            controller: 'addAdvertisementController',
            resolve: {
                links: function () {
                    return [
                        { text: "All Sponsorships", link: "sponsorship.adminList" },
                        { text: "Create Sponsorship", link: "sponsorship.add"}
                    ]
                }
            }

        })

        .state('sponsorship.list', {
            url: '/manage',
            templateUrl: '/uiapp/app/components/trevda/trevdalist.partial.html',
            data: {subTitle: "Manage Sponsorships"},
            controller: 'manageAdvertisementController',
            resolve: {
                ads: function ($http) {
                    return $http.get("/user/getAlist").then(function (ads) {
                        return ads.data;
                    })
                },
                admin: function () {
                    return false;
                },
                links: function () {
                    return [
                        { text: "All Sponsorships", link: "sponsorship.list" },
//                        { text: "Create Sponsorship", link: "sponsorship.add"}
                    ]
                }


            }
        })

        .state('sponsorship.adminList', {
            url: '/admin-list',
            templateUrl: '/uiapp/app/components/trevda/trevdalist.partial.html',
            data: {subTitle: "Manage Sponsorships"},
            controller: 'manageAdvertisementController',
            resolve: {
                ads: function ($http) {
                    return $http.get(apiPath + "/ad").then(function (ads) {
                        return ads.data;
                    })
                },
                admin: function () {
                    return true
                },
                links: function () {

                    return [
                        {text: 'All Sponsorships', link: 'sponsorship.adminList'},
                        {text: 'Create Sponsorship', link: 'sponsorship.add'}
                    ]
                }


            }
        })
        .state('sponsorship.adminReview', {
            url: '/admin-review/:id',
            templateUrl: '/uiapp/app/components/trevda/trevdareview.partial.html',
            data: {subTitle: "Review Sponsorship"},
            controller: 'reviewAdvertisementController',
            resolve: {
                ad: function ($http, $stateParams) {
                    return $http.get(apiPath + "/ad/" + $stateParams.id).then(function (ad) {
                        return ad.data;
                    })
                },
                admin: function () {
                    return true
                },
                links: function () {

                    return [
                        {text: 'All Sponsorships', link: 'sponsorship.adminList'},
                        {text: 'Create Sponsorship', link: 'sponsorship.add'}
                    ]
                }


            }
        })

        .state('sponsorship.edit', {
            url: '/edit/:id',
            templateUrl: '/uiapp/app/components/trevda/edit-trevda.partial.html',
            data: {subTitle: "Edit Sponsorship"},
            controller: 'editAdvertisementController',
            resolve: {
                advertisement: function ($stateParams, $http) {
                    return $http.get("api/v1/ad/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                },

                /*impressions: function ($stateParams, $http) {
                    return $http.get("ad/impressions/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })

                },
                */
                admin: function () {
                    return false
                },
                links: function () {
                    return [
                        { text: "All Sponsorships", link: "sponsorship.list" },
//                        { text: "Create Sponsorship", link: "sponsorship.add"}
                    ]
                }
                /*logs: function ($http, $stateParams) {
                    var d = moment().format("YYYY-MM-DD")
                    return $http.get("/ad/dailyCount?date=" + d + "&id=" + $stateParams.id).then(function (logs) {
                        return logs.data;
                    })
                }*/
            }

        })

        .state('sponsorship.adminEdit', {
            url: '/admin-edit/:id',
            templateUrl: '/uiapp/app/components/trevda/edit-trevda.partial.html',
            data: {subTitle: "Edit Sponsorship"},
            controller: 'editAdvertisementController',
            resolve: {
                advertisement: function ($stateParams, $http) {
                    return $http.get("api/v1/ad/" + $stateParams.id)
                        .then(function (data) {
                            return data.data;
                        })
                },
                admin: function () {
                    return true
                },
                links: function () {

                    return [
                        {text: 'All Sponsorships', link: 'sponsorship.adminList'},
                        {text: 'Create Sponsorship', link: 'sponsorship.add'}
                    ]
                }
            }

        })
        // =========== DASHBOARD

        .state('dash', {
            url: '/dash',
            templateUrl: '/uiapp/app/components/dash/dash.partial.html',
            controller: 'dashController',
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                }
            }
        })

        .state('dash.proprietorowner', {
            templateUrl: '/uiapp/app/components/dash/po-dash.partial.html',
            controller: 'poDashController',
            resolve: {
                venues: function ($http) {
                    return $http.get('/user/getVenues')
                        .then(function (data) {
                            return data.data;
                        })
                }
            }
        })

        .state('dash.proprietormanager', {
            templateUrl: '/uiapp/app/components/dash/pm-dash.partial.html',
            controller: 'pmDashController',
        })
        .state('dash.user', {
            templateUrl: '/uiapp/app/components/dash/user-dash.partial.html',
            controller: 'userDashController',
            resolve: {
                user: function (nucleus) {
                    return nucleus.getMe();
                }
            }
        })
        .state('dash.admin', {
            templateUrl: '/uiapp/app/components/dash/admin-dash.partial.html',
            controller: 'adminDashController',
            resolve: {
                ads: function ($http) {
                    return $http.get('/ad/forReview')
                        .then(function (data) {
                            return data.data
                        })
                },
                userCount: function ($http) {
                    return $http.get('/user/count')
                        .then(function (res) {
                            return res.data.count
                        })
                },
                deviceCount: function ($http) {
                    return $http.get('/device/count')
                        .then(function (res) {
                            return res.data.count
                        })
                },
                adCount: function ($http) {
                    return $http.get('/ad/count')
                        .then(function (res) {
                            return res.data.count
                        })
                }
            }
        })
        .state('dash.sponsor', {
            templateUrl: '/uiapp/app/components/dash/ad-dash.partial.html',
            controller: 'adDashController',
            resolve: {
                ads: function ($http) {
                    return $http.get("/user/getAlist").then(function (ads) {
                        return ads.data;
                    })
                },
                /*logsToday: function ($http) {//TODO user id for this too
                    var d = moment().format("YYYY-MM-DD")
                    return $http.get("/ad/dailyCount?date=" + d).then(function (logs) {
                        return logs.data;
                    })
//could use nucleus.getMe for the user id for the query. tough with session stuff though 

                },
                logsYesterday: function ($http) {
                    var d = moment().subtract(1, 'day').format("YYYY-MM-DD")
                    return $http.get("/ad/dailyCount?date=" + d).then(function (logs) {
                        return logs.data;
                    })
                },
                /*weekly: function($http){
                    return $http.get("ad/weeklyImpressions").then(function(data){
                        return data.data; 
                    })
                }*/
            }
        })


})
;
