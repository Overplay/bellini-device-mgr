/**
 * Created by mkahn on 4/6/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    var navViews = {
        "navtop":  {
            templateUrl: '/ui2app/app/components/navtop/navtop.partial.html',
            controller:  'navTopController'
        },
        "navside": {
            templateUrl: '/ui2app/app/components/navside/navside.partial.html',
            controller:  'navSideController'
        }
    };

    function buildCompleteView( withView ) {
        return _.extend( navViews, { "appbody": withView } );
    }

    $urlRouterProvider.otherwise( '/' );

    $stateProvider

        .state( 'welcome', {
            url:   '/',
            views: buildCompleteView( {
                template:   '<og-spinner></og-spinner>',
                controller: 'redirectController'
            } )
        } )

        // ADMIN ROUTES

        .state( 'admin', {
            abstract: true,
            url:      '/admin',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )

        } )


        .state( 'admin.dashboard', {
            url:     '/dash',
            templateUrl: '/ui2app/app/components/dashboard/dashboard.partial.html',
            controller: 'ogDeviceNumberTileController',
            sideMenu: [
                { label: "Apps", sref: "apps.list", icon: "gears" },
                { label: "Devices", sref: "devices.allactive", icon: "television" },
                { label: "Network", sref: "network.dashboard", icon: "arrows-alt" },
                { label: "Venues", sref: "venues.list", icon: "globe" },
                { label: "Users", sref: "admin.userlist", icon: "users" },
                { label: "Maintenance", sref: "admin.maint", icon: "gears" }
            ],
            resolve: {
                ogdevices: function (sailsOGDevice) {
                    return sailsOGDevice.getAll();
                }
            }
        } )

        .state( 'admin.userlist', {
            url:         '/userlist',
            templateUrl: '/ui2app/app/components/admin/userlist.partial.html',
            controller:  'adminUserListController',
            resolve:     {
                users: function ( sailsUsers ) {
                    return sailsUsers.getAll();
                }
            }
        } )

        .state( 'admin.edituser', {
            url:         '/edituser/:id',
            templateUrl: '/ui2app/app/components/admin/edituser.partial.html',
            controller:  'adminUserEditController',
            resolve:     {
                user2edit: function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                }
            }

        } )


        // ACCOUNT

        .state( 'myaccount', {
            url:   '/myaccount',
            views: buildCompleteView( {
                templateUrl: '/ui2app/app/components/account/myaccount.partial.html',
                controller: 'myAccountController'
                 })
        })

        // Copied from BC





        // CORE ROUTES

        // Placeholder for later
        .state( 'reports', {
            abstract: true,
            url:      '/reports',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )

        } )

        .state( 'reports.loading', {
            url:      '/loading',
            templateUrl: '/ui2app/app/components/reports/loading.partial.html',
            controller: 'deviceLoadingController'
        } )


        // Devices
        .state( 'devices', {
            abstract: true,
            url:      '/devices',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        })

        .state( 'devices.allactive', {
            url:         '/allactive',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicelist.partial.html',
            controller:  'listOGDeviceController',
            resolve:     {
                ogdevices:      function ( sailsOGDevice ) {
                    return sailsOGDevice.getAll();
                }
            }

        } )

        .state( 'devices.bullpen', {
            url:         '/bullpen',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicebullpen.partial.html'
        } )

        .state( 'devices.byvenue', {
            url:         '/byvenue',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicebyvenue.partial.html'
        } )

        .state( 'devices.detail', {
            url:         '/detail/:id',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicedetail.partial.html',
            controller:  'oGDeviceDetailController',
            resolve:    {
                device: function ( sailsOGDevice, $stateParams ) {
                    return sailsOGDevice.get( $stateParams.id );
                }
            }
        } )

        .state( 'venues', {
            abstract: true,
            url:      '/venues',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )

        .state( 'venues.list', {
            url:         '/list',
            templateUrl: '/ui2app/app/components/admin/venuelist.partial.html',
            controller:  'adminVenueListController',
            resolve:    {
                venues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            }

        } )

        // Devices
        .state( 'network', {
            abstract: true,
            url:      '/network',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )
        } )

        .state( 'network.dashboard', {
            url:         '/dash',
            templateUrl: '/ui2app/app/components/sockets/socketdash.partial.html',
            controller:  'socketDashController'
        } )

        .state( 'apps', {
            abstract: true,
            url:      '/apps',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } )

        } )

        .state( 'apps.list', {
            url:         '/list',
            templateUrl: '/ui2app/app/components/apps/applist.partial.html',
            controller:  'appListController',
            sideMenu: [
                { label: "Home", sref: "welcome", icon: "home" },
                { label: "Add App", sref: "apps.edit({id: 'new'})", icon: "gear" }
            ],
            resolve:     {
                apps: function ( sailsApps ) {
                    return sailsApps.getAll();
                }
            }

        } )

        .state( 'apps.edit', {
            url:         '/edit/:id',
            templateUrl: '/ui2app/app/components/apps/appedit.partial.html',
            controller:  'appEditController',
            sideMenu: [
                { label: "Home", sref: "welcome", icon: "home" },
                { label: "Apps", sref: "apps.list", icon: "gears" },
                { label: "Add App", sref: "apps.edit({id: 'new'})", icon: "star" }
            ],
            resolve:    {
                app:    function ( sailsApps, $stateParams ) {
                    return sailsApps.get( $stateParams.id );
                }
            }

        } )


} );
