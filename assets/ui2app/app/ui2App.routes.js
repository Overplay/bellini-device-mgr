/**
 * Created by mkahn on 4/6/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    var navViews = {
        "navtop":  {
            templateUrl: '/ui2app/app/components/navtop/navtop.partial.html',
            controller:  'navTopController'
            // resolve:     {
            //     user: function ( userAuthService ) {
            //         return userAuthService.getCurrentUser();
            //     }
            // }
        },
        "navside": {
            templateUrl: '/ui2app/app/components/navside/navside.partial.html',
            controller:  'navSideController'
        }
    };

    function buildCompleteView( withView ) {
        return _.extend( navViews, { "appbody": withView } );
    }

    function withUserResolve( resolvers ) {
        return _.extend( resolvers, {
            user: function ( userAuthService ) {
                return userAuthService.getCurrentUser();
            }
        } );
    }

    $urlRouterProvider.otherwise( '/' );

    $stateProvider

        .state( 'dashboard', {
            url:     '/',
            views:   buildCompleteView( {
                templateUrl: '/ui2app/app/components/dashboard/dashboard.partial.html',
                controller: 'ogDeviceNumberTileController'

            } ),
            resolve: {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'dashMenu' );
                },
                ogdevices: function (sailsOGDevice) {
                    return sailsOGDevice.getAll();
                }
            }
        } )

        // ACCOUNT

        .state( 'myaccount', {
            url:   '/myaccount',
            views: buildCompleteView( {
                templateUrl: '/ui2app/app/components/account/myaccount.partial.html',
                controller: 'myAccountController'
                 }),
            resolve: withUserResolve( {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'accountMenu' );
                }
            })
        })

        // Copied from BC

        // ADMIN ROUTES

        .state( 'admin', {
            abstract: true,
            url:      '/admin',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'dashMenu' );
                }
            }
        } )

        .state( 'admin.userlist', {
            url:         '/userlist',
            templateUrl: '/ui2app/app/components/admin/userlist.partial.html',
            controller:  'adminUserListController',
            resolve:     withUserResolve({
                users: function ( sailsUsers ) {
                    return sailsUsers.getAll();
                },
                sm:    function ( navService ) {
                    navService.sideMenu.change( 'adminUserMenu' );
                }
            })
        } )

        .state( 'admin.edituser', {
            url:         '/edituser/:id',
            templateUrl: '/ui2app/app/components/admin/edituser.partial.html',
            controller:  'adminUserEditController',
            resolve:     withUserResolve({
                user2edit:      function ( sailsUsers, $stateParams ) {
                    return sailsUsers.get( $stateParams.id );
                }
            })

        } )



        // CORE ROUTES

        // Placeholder for later
        .state( 'reports', {
            abstract: true,
            url:      '/reports',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'adminMenu' );
                }
            }
        } )

        .state( 'reports.loading', {
            url:      '/loading',
            templateUrl: '/ui2app/app/components/reports/loading.partial.html',
            controller: 'deviceLoadingController',
            resolve: {
            }
        } )


        // Devices
        .state( 'devices', {
            abstract: true,
            url:      '/devices',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve: {
                sm: function ( navService ) {
                    navService.sideMenu.change( 'deviceMenu' );
                }
            }
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
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicebullpen.partial.html',
            // controller:  'listOGDeviceController',
            // resolve:     {
            //     devices: function ( sailsOGDevice ) {
            //         return sailsOGDevice.getAll();
            //     }
            // }

        } )

        .state( 'devices.byvenue', {
            url:         '/byvenue',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicebyvenue.partial.html',
            // controller:  'listOGDeviceController',
            // resolve:     {
            //     devices: function ( sailsOGDevice ) {
            //         return sailsOGDevice.getAll();
            //     }
            // }

        } )

        .state( 'devices.detail', {
            url:         '/detail/:id',
            templateUrl: '/ui2app/app/components/ogdevices/ogdevicedetail.partial.html',
            controller:  'oGDeviceDetailController',
            resolve:     withUserResolve({
                device: function ( sailsOGDevice, $stateParams ) {
                    return sailsOGDevice.get( $stateParams.id );
                }//,
                // venues: function( sailsVenues){
                //     return sailsVenues.getAll();
                // }
            })
        } )

        .state( 'venues', {
            abstract: true,
            url:      '/venues',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  withUserResolve({
                sm: function ( navService ) {
                    navService.sideMenu.change( 'venueMenu' );
                }
            })
        } )

        .state( 'venues.list', {
            url:         '/list',
            templateUrl: '/ui2app/app/components/admin/venuelist.partial.html',
            controller:  'adminVenueListController',
            resolve:     withUserResolve({
                venues: function ( sailsVenues ) {
                    return sailsVenues.getAll();
                }
            })

        } )

        // Devices
        .state( 'network', {
            abstract: true,
            url:      '/network',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            // This little hack sets the side menu for each major state
            resolve:  withUserResolve({
                sm: function ( navService ) {
                    navService.sideMenu.change( 'networkMenu' );
                }
            })
        } )

        .state( 'network.dashboard', {
            url:         '/dash',
            templateUrl: '/ui2app/app/components/sockets/socketdash.partial.html',
            controller:  'socketDashController',
            // resolve:     {
            //     ogdevices: function ( sailsOGDevice ) {
            //         return sailsOGDevice.getAll();
            //     }
            // }

        } )

        .state( 'apps', {
            abstract: true,
            url:      '/apps',
            views:    buildCompleteView( { template: '<ui-view></ui-view>', } ),
            resolve:  withUserResolve({
                sm: function ( navService ) {
                    navService.sideMenu.change( 'appsMenu' );
                }
            })
        } )

        .state( 'apps.list', {
            url:         '/list',
            templateUrl: '/ui2app/app/components/apps/applist.partial.html',
            controller:  'appListController',
            resolve:     withUserResolve({
                apps: function ( sailsApps ) {
                    return sailsApps.getAll();
                }
            })

        } )

        .state( 'apps.edit', {
            url:         '/edit/:id',
            templateUrl: '/ui2app/app/components/apps/appedit.partial.html',
            controller:  'appEditController',
            resolve:     withUserResolve({
                app:    function ( sailsApps, $stateParams ) {
                    return sailsApps.get( $stateParams.id );
                }
            })

        } )


} );
