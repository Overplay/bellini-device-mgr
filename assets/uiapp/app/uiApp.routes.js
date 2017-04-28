/**
 * Created by mkahn on 4/6/16.
 */

app.config(function ($stateProvider, $urlRouterProvider) {

    console.debug("Loading routes");

    var apiPath = 'api/v1';

    $urlRouterProvider.otherwise('/dash');

    $stateProvider

    // =========== DASHBOARD

        .state( 'dash', {
            url:         '/dash',
            templateUrl: '/uiapp/app/components/dash/dash.partial.html',
            controller:  'dashController'
        } )



        .state( 'sockettest', {
                url: '/sockettest',
                templateUrl: '/uiapp/app/components/socket/socket.partial.html',
                controller:  'socketController'
            }
        )

        .state( 'sockets', {
                url:         '/sockets',
                templateUrl: '/uiapp/app/components/socket/socketdash.partial.html',
                controller:  'socketDashController'
            }
        )
                             
       

        .state('user', {
            url: '/user',
            templateUrl: '/uiapp/app/components/user/user-sidemenu.partial.html',
            controller: function ($scope) {
                $scope.panelHeading = {text: "", color: "#0000FF"}
            },
            abstract: true
        })

        // Modified for BDM
        .state( 'user.adminList', {
            url:         '/admin-list',
            data:        { subTitle: "Manage Users" },
            controller:  'listUserController',
            templateUrl: '/uiapp/app/components/user/userlist.partial.html',
            resolve:     {
                users: function ( nucleus ) {
                    return nucleus.getAuth()
                },
                links: function () {
                    return [
                        { text: "All Users", link: "user.adminList" },
                        { text: "Add User", link: "user.addUser" }
                    ]
                }
            }

        } )
        
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





        /**
         * New stuff added by Mitch
         */

        .state( 'ogdevice', {
            url:         '/ogdevice',
            templateUrl: '/uiapp/app/components/ogdevice/ogdevice-sidemenu.partial.html',
            controller:  function ( $scope ) {
                $scope.panelHeading = { text: "", color: "#0000FF" }
            },
            abstract:    true
        } )

        .state( 'ogdevice.list', {
            url:         '/list',
            controller:  'listOGDeviceController',
            templateUrl: '/uiapp/app/components/ogdevice/ogdevicelist.partial.html',
            resolve:     {
                devices: function ( $http ) {
                    return $http.get( '/api/v1/ogdevice' )
                        .then( function ( data ) {
                            return data.data;
                        } )
                }
            }
        } )

        .state( 'ogdevice.moreinfo', {
            url:         '/moreinfo/:id',
            controller:  'oGDeviceDetailController',
            templateUrl: '/uiapp/app/components/ogdevice/ogdevicedetail.partial.html',
            resolve:     {
                device: function ( $http, $stateParams ) {
                    return $http.get( '/api/v1/ogdevice/'+ $stateParams.id )
                        .then( function ( data ) {
                            return data.data;
                        } )
                },
                venues: function ($http){
                    return $http.get( '/api/v1/venue').then(function(d){ return d.data });
                }
            }
        } )


    /**
     * LITE version of the Venue routes from Bellini Core
     */

        .state( 'venue', {
            url:         '/venue',
            templateUrl: '/uiapp/app/components/venue/venue-sidemenu.partial.html',
            controller:  function ( $scope ) {
                $scope.ui = { panelHeading: "", pageTitle: "" };
            },
            abstract:    true
        } )

        .state( 'venue.view', {
            url:         '/view/:id',
            resolve:     {
                venue: function ( $http, $stateParams ) {
                    return $http.get( apiPath + "/venue/" + $stateParams.id )
                        .then( function ( data ) {
                            return data.data;
                        } )
                        .catch( function ( err ) {
                            return err;
                        } )
                },
                links: function () {
                    return [
                    ]
                },
                role:  function () {
                    return "admin";
                }
            },
            templateUrl: '/uiapp/app/components/venue/viewvenue.partial.html',
            controller:  'viewVenueController'
        } )

        .state( 'venue.list', {
            url:         '/admin-list',
            controller:  'listVenueController',
            templateUrl: '/uiapp/app/components/venue/venuelist.partial.html',
            resolve:     {
                venues: function ( $http ) {
                    return $http.get( apiPath + '/venue' )
                        .then( function ( data ) {
                            return data.data;
                        } )
                },
                links:  function () {
                    return [
                    ]
                },
                role:   function () {
                    return "admin";
                }
            }
        } )

 

})
;
