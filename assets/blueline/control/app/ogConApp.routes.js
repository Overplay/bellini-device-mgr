app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );


    $urlRouterProvider.otherwise( '/top' );

    $stateProvider


        .state( 'top', {
            url:   '/top',
            template: '<div ui-view="toptab"></div><div ui-view="appbody"></div>',
            controller: 'switchController',
            resolve: {
                ogDevice: function ( ogNet ) {
                    return ogNet.init().then( function () { return ogNet.getDeviceInfo() } );
                }
            }

        } )

        .state( 'top.mdash', {
            url:         '/mdash',
            views: {
                "toptab":  {
                    templateUrl: 'app/components/toptabbar/toptabbar.template.html',
                    controller: 'topTabBarController'
                },
                "appbody": {
                    templateUrl: 'app/components/dashboard/managerdashboard.template.html',
                    controller:  'managerDashboardController'
                }
            }

        } )

        .state( 'top.mguide', {
            url:         '/mguide',
            views: {
                "toptab":  {
                    templateUrl:    'app/components/toptabbar/toptabbar.template.html',
                    controller:     'topTabBarController'
                },
                "appbody": {
                    templateUrl:    'app/components/guide/guide.template.html',
                    controller:     'guideController'
                }
            },

        } )

        .state( 'top.settings', {
            url:         '/settings',
            views: {
                "toptab":  {
                    templateUrl: 'app/components/toptabbar/toptabbar.template.html',
                    controller:  'topTabBarController'
                },
                "appbody": {
                    templateUrl: 'app/components/settings/settings.template.html',
                    controller:  'settingsController'
                }
            }

        } )


        // PATRON IN THE HOUSE

        .state( 'top.pdash', {
            url:   '/pdash',
            views: {
                "toptab":  {
                    templateUrl: 'app/components/toptabbar/toptabbar.template.html',
                    controller:  'topTabBarController'
                },
                "appbody": {
                    templateUrl: 'app/components/dashboard/patrondashboard.template.html',
                    controller:  'patronDashboardController'
                }
            }

        } )

        .state( 'top.tv', {
            url:   '/tv',
            views: {
                "toptab":  {
                    templateUrl: 'app/components/toptabbar/toptabbar.template.html',
                    controller:  'topTabBarController'
                },
                "appbody": {
                    templateUrl: 'app/components/guide/guide.template.html',
                    controller:  'guideController'
                }
            },

        } )





        .state( 'register', {
            url:         '/register',
            templateUrl: 'app/components/register/register.template.html',
            controller:  'registerController',
            resolve:     {
                ogDevice: function ( ogNet ) {
                    return ogNet.getDeviceInfo();
                }
            }

        } )


} );