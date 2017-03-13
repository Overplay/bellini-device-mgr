/**
 *
 * ogAPI rewritten for Beta Architecture
 *
 *
 * USAGE:
 *  import source
 *  inject 'ourglassAPI' intot he root app module
 *
 */


/**
 * Global variable set from the Android side when an  OGWebViewFragment starts.
 * As of early March 2017, this code is not working, but that's OK, the shared
 * Java Object method is working, and it's actually better.
 * @type {{}}
 */

// TODO Deprecate
var OG_SYSTEM_GLOBALS = {};

function SET_SYSTEM_GLOBALS_JSON( jsonString ) {
    OG_SYSTEM_GLOBALS = JSON.parse( jsonString );
    OG_SYSTEM_GLOBALS.updatedAt = new Date();
}


(function ( window, angular, undefined ) {


    //Helper with chaining Angular $http
    function stripData( response ) {
        return response.data;
    }

    /**
     * This relies on the addJsonInterface on the Android side!
     * @returns {any}
     */
    function getOGSystem() {

        if ( window.OGSystem )
            return JSON.parse( window.OGSystem.getSystemInfo() );

        // TODO some of this mock data should be modifiable during debug
        return {
            abVersionCode:  99,
            abVersionName:  '9.9.99',
            osVersion:      "9.9.9.",
            randomFactoid:  "This is mock data",
            name:           'Simulato',
            wifiMacAddress: '00:11:22:33',
            outputRes:      { height: 1080, width: 1920 },
            udid:           'testy-mc-testerton',
            venue:          'testvenue',
            osApiLevel:     99,
            mock:           true
        }
    }

    function isRunningInAndroid() {
        return window.OGSystem;
    }

    angular.module( 'ourglassAPI', [] )

    // Advertising service
        .factory( 'ogAds', function ( $http, $log ) {

            var _forceAllAds = true;

            var _currentAd;
            var _adRotation = [];
            var _adIndex = 0;

            var urlForAllAds = '/proxysponsor/all';
            var urlForVenueAds = '/proxysponsor/venue/';

            var service = {};

            function processNewAds( newAds ) {
                $log.debug( "ogAds loaded " + newAds.length + " ads. Enjoy!" );
                _adRotation = newAds;
                _adIndex = 0;
                return _adRotation;
            }

            service.refreshAds = function () {
                var url = ( getOGSystem().venue && !_forceAllAds ) ? (urlForVenueAds + getOGSystem().venue) : urlForAllAds;
                return $http.get( url )
                    .then( stripData )
                    .then( processNewAds )
            }

            service.getNextAd = function () {

                if ( !_adRotation.length )
                    return null;

                _adIndex = (_adIndex + 1) % _adRotation.length;
                return _adRotation[ _adIndex ];

            }


            service.getImgUrl = function ( adType ) {

                if ( _adRotation.length ) {
                    // TODO this needs more checking or a try catch because it can blow up if an ad does not have
                    // a particular kind (crawler, widget, etc.
                    var ad = _adRotation[ _adIndex ];
                    return ad.mediaBaseUrl + ad.advert.media[ adType ];

                } else {

                    switch ( adType ) {

                        case "crawler":
                            return "/blueline/common/img/oglogo_crawler_ad.png";

                        case "widget":
                            return "/blueline/common/img/oglogo_widget_ad.png";

                        default:
                            throw Error( "No such ad type: " + adType );

                    }
                }
            };

            service.setForceAllAds = function ( alwaysGetAll ) {
                _forceAllAds = alwaysGetAll;
            };

            service.refreshAds(); // load 'em to start!

            return service;

        } )


        /***************************
         *
         * Common (mobile and TV) app service
         *
         ***************************/
        .factory( 'ogAPI', function ( $http, $log, $interval, $q, $rootScope ) {

            //local variables
            var _usingSockets;

            // unique name, like io.ourglass.cralwer
            var _appName;
            var _appType;

            var _deviceUDID = getOGSystem().udid;
            var _lockKey;

            // Data callback when data on BL has changed
            var _dataCb;
            // Message callback when a DM is sent from BL
            var _msgCb;

            var service = { model: {} };

            function updateModel( newData ) {
                service.model = newData;
                if ( _dataCb ) _dataCb( service.model );
                return service.model;
            }

            // updated for BlueLine
            function getDataForApp() {
                return $http.get( '/appmodel/' + _appName + '/' + _deviceUDID )
                    .then( stripData )
                    .then( stripData ); // conveniently the object goes resp.data.data
            }

            // TODO someone should implement locking someday :D [mak]
            function getDataForAppAndLock() {
                return $http.get( API_PATH + 'appdata/' + _appName + "?lock" )
                    .then( stripData );
            }

            function joinDeviceRoom() {
                return $q( function ( resolve, reject ) {

                    io.socket.post( '/ogdevice/joinroom', {
                        deviceUDID: _deviceUDID
                    }, function ( resData, jwres ) {
                        console.log( resData );
                        if ( jwres.statusCode != 200 ) {
                            reject( jwres );
                        } else {
                            $log.debug( "Successfully joined room for this device" );
                            io.socket.on( 'DEVICE-DM', function ( data ) {
                                if ( _msgCb ) {
                                    $rootScope.$apply( function () {
                                        _msgCb( data );
                                    } );
                                } else {
                                    console.log( 'Dropping sio message rx (no cb):' + JSON.stringify( data ) );
                                }
                            } );

                            resolve();
                        }
                    } );
                } );

            }

            function joinVenueRoom() {

            }

            function subscribeToAppData() {

                return $q( function ( resolve, reject ) {

                    io.socket.post( '/appdata/subscribe', {
                        deviceUDID: _deviceUDID,
                        appid:      _appName
                    }, function ( resData, jwres ) {
                        console.log( resData );
                        if ( jwres.statusCode != 200 ) {
                            reject( jwres );
                        } else {
                            $log.debug( "Successfully subscribed to appData" );
                            io.socket.on( 'appdata', function ( data ) {
                                service.model = data.data;
                                if ( _dataCb ) {
                                    $rootScope.$apply( function () {
                                        _dataCb( service.model );
                                        console.log( 'AppData change for ' + service.model );
                                    } );
                                } else {
                                    console.log( 'Dropping sio data change rx (no cb):' + JSON.stringify( data ) );
                                }

                            } );

                            resolve();
                        }
                    } );
                } )
            }

            service.init = function ( params ) {

                if ( !params )
                    throw new Error( "try using some params, sparky" );

                _usingSockets = params.sockets || true;
                if ( !_usingSockets )
                    throw new Error( "You must use websockets in this version of ogAPI!" );

                // Check the app type
                if ( !params.appType ) {
                    throw new Error( "appType parameter missing and is required." );
                }

                _appType = params.appType;
                $log.debug( "Init called for app type: " + _appType );

                if (_appType!="tv") {
                    if (!params.deviceUDID){
                        throw new Error( "This app type requires a deviceUDID parameter!")
                    } else if (params.deviceUDID!='test') {
                        _deviceUDID = params.deviceUDID;
                    } else {
                        // TODO this is a nasty, dirty, straight up hack
                        _deviceUDID = getOGSystem().udid;
                    }
                }

                // Check the app name
                if ( !params.appName ) {
                    throw new Error( "appName parameter missing and is required." );
                }

                _appName = params.appName;
                $log.debug( "Init for app: " + _appName );

                _dataCb = params.modelCallback;
                if ( !_dataCb )
                    $log.warn( "You didn't specify a modelCallback, so you won't get one!" );

                _msgCb = params.messageCallback;
                if ( !_dataCb )
                    $log.warn( "You didn't specify a messageCallback, so you won't get one!" );

                io.socket.on( "connect", function () {
                    $log.debug( "(Re)Connecting to websockets rooms" );
                    joinDeviceRoom();
                    subscribeToAppData();
                } );

                return $http.post( '/appmodel/initialize', { appid: _appName, deviceUDID: _deviceUDID } )
                    .then( stripData )
                    .then( stripData ) // Yes, twice because data.data.data
                    .then( function ( model ) {
                        $log.debug( "ogAPI: Model data init complete" );
                        $log.debug( "ogAPI: Subscribing to model changes" );
                        service.model = model;
                        return subscribeToAppData();
                    } )
                    .then( function () {
                        $log.debug( "ogAPI: Subscribing to message changes" );
                        return joinDeviceRoom();
                    } )
                    .then( function () {
                        return service.model;
                    } );

            };

            // TODO if we were cool kids we might make this an Observable
            function sendSIOMessage( url, message ) {
                var wrappedMessage = { deviceUDID: _deviceUDID, message: message };
                return $q( function ( resolve, reject ) {
                    io.socket.post( url, wrappedMessage, function ( resData, jwRes ) {
                        if ( jwRes.statusCode != 200 ) {
                            reject( jwRes );
                        } else {
                            resolve({ resData: resData, jwRes: jwRes });
                        }
                    } );

                } );
            }


            function sioPut( url, params ) {
                return $q( function ( resolve, reject ) {
                    io.socket.put( url, params, function ( resData, jwRes ) {
                        if ( jwRes.statusCode != 200 ) {
                            reject( jwRes );
                        } else {
                            resolve( { resData: resData, jwRes: jwRes } );
                        }
                    } );

                } );
            }


            service.sendMessageToDeviceRoom = function (message) {
                // NOTE must have leading slash!
                return sendSIOMessage('/ogdevice/dm', message);
            };

            service.sendMessageToVenueRoom = function ( message ) {
                // NOTE must have leading slash!
                return sendSIOMessage( '/venue/dm', message );
            };


            // TODO Twitter scraping needs to either move into Bellini or into Buc
            // service.getTweets = function () {
            //     return $http.get( API_PATH + 'scrape/' + _appName )
            //         .then( stripData );
            // };
            //
            // service.getChannelTweets = function () {
            //     return $http.get( API_PATH + 'scrape/io.ourglass.core.channeltweets' )
            //         .then( stripData );
            // };
            //
            // service.updateTwitterQuery = function ( paramsArr ) {
            //     var query = paramsArr.join( '+OR+' );
            //     return $http.post( API_PATH + 'scrape/' + _appName, { query: query } );
            // };


            // updated for BlueLine
            // TODO replace with socketIO?
            service.saveHTTP = function () {
                return $http.put( '/appmodel/' + _appName + '/' + _deviceUDID, { data: service.model } )
                    .then( stripData )
                    .then( function ( data ) {
                        $log.debug( "ogAPI: Model data saved via PUT" );
                        //updateModel( data[0] )
                    } )
            };

            service.save = function () {
                return sioPut( '/appmodel/' + _appName + '/' + _deviceUDID, { data: service.model } )
                    .then( function ( data ) {
                        $log.debug( "ogAPI: Model data saved via si PUT" );
                        return data.resData;
                    } )
            };

            service.loadModel = function () {
                return getDataForApp()
                    .then( updateModel );
            };

            // TODO implement model locking on Bellini side...
            service.loadModelAndLock = function () {
                return getDataForAppAndLock()
                    .then( function ( model ) {
                        if ( !model.hasOwnProperty( 'lockKey' ) )
                            throw new Error( "Could not acquire lock" );

                        _lockKey = model.lockKey;
                        model.lockKey = undefined;
                        return model;
                    } )
                    .then( updateModel );
            };

            /**
             * performs a post to the move endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.move = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/move' );
            }

            /**
             * performs a post to the launch endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}         */
            service.launch = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/launch' );
            }

            /**
             * performs a post to the kill endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.kill = function ( appid ) {
                appid = appid || _appName;
                //should be able to return the promise object and act on it
                return $http.post( API_PATH + 'app/' + appid + '/kill' );
            }

            /**
             * posts up an SMS message request
             * @param args
             */
            service.sendSms = function ( phoneNumber, message ) {
                //TODO need to implement the endpoint in AB and need some security...
                return $http.post( API_PATH + 'app/' + appid + '/notify', {
                    phoneNumber: phoneNumber,
                    message:     message
                } );
            }

            /**
             *
             * @param email should be { to: emailAddr, emailbody: text }
             * @returns {HttpPromise}
             */
            service.sendSpam = function ( email ) {
                return $http.post( API_PATH + 'spam', email );
            }


            // New methods for BlueLine Architecture

            service.getOGSystem = getOGSystem;

            return service;

        } )


        .factory( 'ogProgramGuide', function ( $http, $log, $interval ) {

            var service = {};

            service.getNowAndNext = function () {
                return $http.get( API_PATH + 'tv/currentgrid' )
                    .then( stripData );
            }

            service.changeChannel = function ( channelNum ) {
                return $http.post( API_PATH + 'tv/change/' + channelNum );
            }

            return service;
        } )

        .directive( 'ogAdvert', function ( $log, ogAds, $interval, $timeout ) {
            return {
                restrict: 'E',
                template: '<img width="100%" height="100%" style="-webkit-transition: opacity 0.5s; transition: opacity 0.5s;" ' +
                          'ng-style="adstyle" ng-src=\"{{adurl}}\"/>',
                link:     function ( scope, elem, attrs ) {

                    var interval = parseInt( attrs.interval ) || 15000;
                    var adType = attrs.type || 'widget';
                    var intervalPromise;

                    scope.adstyle = { opacity: 0.0 };

                    if ( adType != 'widget' && adType != 'crawler' ) {
                        throw Error( "Unsupported ad type. Must be widget or crawler" )
                    }

                    function update() {

                        scope.adstyle.opacity = 0;
                        $timeout( function () {
                            scope.adurl = ogAds.getImgUrl( adType );
                            scope.adstyle.opacity = 1;
                            // HACK ALERT...let's trigger a new ad load
                            $timeout( ogAds.getNextAd, 200 );

                        }, 1200 );

                    }

                    update();

                    intervalPromise = $interval( update, interval );

                    scope.$on( '$destroy', function () {
                        $interval.cancel( intervalPromise );
                    } );

                }
            }

        } )

        .directive( 'ogAdvertisement', function () {
            return {
                restrict:   'E',
                scope:      {
                    type: '@'
                },
                template:   '<img width="100%" ng-src=\"{{adurl}}\">',
                controller: function ( $scope, $http ) {

                    var ipAddress = "http://localhost";

                    try {
                        console.log( $scope.type );
                    } catch ( e ) {
                    }
                    try {
                        console.log( scope.type );
                    } catch ( e ) {
                    }

                    if ( !currentAd ) {
                        $http.get( ipAddress + ":9090" + "/api/ad" ).then( function ( retAd ) {
                            currentAd = retAd.data;
                            console.log( currentAd );
                            setCurrentAdUrl();
                        } )
                    } else {
                        setCurrentAdUrl();
                    }
                    function setCurrentAdUrl() {
                        console.log( $scope );
                        console.log( $scope.type );
                        if ( $scope.type == 'widget' ) {
                            console.log( '1' );
                            console.log( ipAddress + " " + ":9090" + " " + currentAd.widgetUrl );
                            $scope.adurl = ipAddress + ":9090" + currentAd.widgetUrl;
                        }
                        else if ( $scope.type == 'crawler' ) {
                            $scope.adurl = ipAddress + ":9090" + currentAd.crawlerUrl;
                        }

                        console.log( $scope.adurl );
                    }
                }
            }
        } )

        .directive( 'ogAppHeader', function () {
            return {
                link:        function ( scope, elem, attr ) {
                    scope.name = attr.name || "Missing Name Attribute";
                },
                templateUrl: 'ogdirectives/appheader.html'
            };
        } )

        .directive( 'ogFallbackImg', function ( $log ) {
            return {
                restrict: 'A',
                link:     function ( scope, element, attrs ) {

                    element.bind( 'error', function () {
                        $log.debug( "Source not found for image, using fallback" );
                        attrs.$set( "src", attrs.ogFallbackImg );
                    } );

                }
            }
        } )

        .directive( 'ogHud', [ "$log", "$timeout", function ( $log, $timeout ) {
            return {
                scope:       {
                    message:      '=',
                    dismissAfter: '@',
                    issue:        '='
                },
                link:        function ( scope, elem, attr ) {

                    scope.ui = { show: false };

                    scope.$watch( 'issue', function ( nval ) {
                        if ( nval ) {
                            $log.debug( 'firing HUD' );
                            scope.ui.show = true;
                            $timeout( function () {
                                scope.ui.show = false;
                                scope.issue = false;
                            }, scope.dismissAfter || 2000 );
                        }
                    } );

                },
                templateUrl: 'ogdirectives/hud.html'
            };
        } ] )

        .controller( 'Controller', [ '$scope', function ( $scope ) {
        } ] );
    var currentAd;
})( window, window.angular );

angular.module( "ourglassAPI" ).run( [ "$templateCache",
    function ( $templateCache ) {

        // HUD
        $templateCache.put( 'ogdirectives/hud.html',
            '<div ng-if="ui.show" style="width: 100vw; height: 100vh; background-color: rgba(30,30,30,0.25);">' +
            // '<div style="margin-top: 30vh; width: 100vw;"> <img src="/www/common/img/box.gif"/></div>' +
            '<div style="margin-top: 40vh; width: 100vw; text-align: center;"> {{ message }}</div>' +
            '</div>' );

        $templateCache.put( 'ogdirectives/appheader.html', '<style>.ogappheader{display:table;' +
            'font-size:2em;font-weight:bold;height:60px;margin:0 0 10px 0}' +
            '.ogappheadertext{display:table-cell;vertical-align:middle}' +
            '.ogappheaderside{height:60px;width:20px;background-color:#21b9e6;float:left;margin-right:10px}</style>' +
            '<div class="ogappheader"><div class="ogappheaderside"></div>' +
            '<div class="ogappheadertext">{{name | uppercase}}</div></div>' );

    } ] );