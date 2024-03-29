/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Ourglass TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller( "crawlerController",
    function ( $scope, $timeout, $http, $interval, ogAPI, $log, $window, $q, ogAds ) {

        //Maximum number of tweets to show
        var TWEET_COUNT = 10;

        // var testVertMessages = [
        //     { header: "Coming Up", messages: [ "Basketball", "Curling", "Soccer " ] }
        // ]

        $scope.mode = 'sm-top';
        $scope.vertMessages = [];
        $scope.crawlerMessages = [];

        var crawlerModel = {
            user:    [],
            twitter: [],
            ads:     []
        };

        var _venueData;
        var _deviceData;
        var _useVenueData;

        $scope.ui = { appMuted: false };

        $scope.$on("MUTE_APP", function(ev, data){
            $scope.$apply(function(){
                $scope.ui.appMuted = data.isMuted;
                if ($scope.ui.appMuted){
                    $timeout(function(){ $scope.ui.appMuted = false; }, 1000 * 60 * 60 * 2);
                }
            });
        });

        $scope.hideMe = function(){
            $scope.appMuted = !$scope.appMuted;
        }

        //function to set the display messages to the randomized concatenation of user and twitter messages
        //and coming up
        function updateDisplay() {

            crawlerModel.user = _useVenueData ? _venueData.messages : _deviceData.messages;
            $scope.mode = ( _useVenueData ? _venueData.mode : _deviceData.mode ) || 'full-size';
            $scope.mode = 'full-size';

            getTVGrid();

            ogAds.getCurrentAd()
                .then( function ( currentAd ) {
                    crawlerModel.ads = currentAd.textAds || [];
                } )
                .then( reloadTweets )
                .then( function () {

                    $log.debug( "Rebuilding hz scroller feed" );
                    var tempArr = [];
                    crawlerModel.user.forEach( function ( um ) {
                        tempArr.push( { text: um, style: { color: '#ffffff' } } )
                    } );

                    crawlerModel.twitter.forEach( function ( um ) {
                        tempArr.push( { text: um, style: { color: '#87CEEB' } } )
                    } );

                    crawlerModel.ads.forEach( function ( um ) {
                        tempArr.push( { text: um, style: { color: '#ccf936' } } )
                    } );

                    tempArr = tempArr.filter( function ( x ) {
                        return (x !== (undefined || !x.message));
                    } );

                    $scope.crawlerMessages = _.shuffle( tempArr );
                } );

        }

        function deviceModelUpdate( data ) {
            $log.debug( "crawler: got a device model update!" );
            _deviceData = data;
            if ( data.useVenueData !== _useVenueData )
                $log.debug("Data source changed.");
            _useVenueData = data.useVenueData;
            updateDisplay();
        }

        function venueModelUpdate( data ) {
            $log.debug( "crawler: got a venue model update!" );
            _venueData = data;
            updateDisplay();
        }

        function reloadTweets() {

            $log.debug( "Grabbing tweets" );
            // Venuetweets is a hack, for now
            return $q.all( [ ogAPI.getTweets(true), ogAPI.getChannelTweets() ] )
                .then( function ( tweets ) {

                    $log.debug( "HideTVTweets is " + (ogAPI.model.hideTVTweets ? "on" : "off") );

                    if ( ogAPI.model.hideTVTweets )
                        tweets[ 1 ] = {};

                    var mergedTweets = _.merge( tweets[ 0 ], tweets[ 1 ] );

                    if ( mergedTweets.statuses ) {
                        var tempArr = [];

                        var count = ( mergedTweets.statuses.length > TWEET_COUNT ) ? TWEET_COUNT : mergedTweets.statuses.length;

                        for ( var i = 0; i < count; i++ ) {
                            var usableTweet = mergedTweets.statuses[ i ].text;
                            usableTweet = usableTweet.replace( /(?:https?|ftp):\/\/[\n\S]+/g, '' );
                            usableTweet = usableTweet.replace( /&amp;/g, '&' );
                            tempArr.push( usableTweet );
                        }

                        if ( tempArr.length > 0 )
                            crawlerModel.twitter = _.shuffle( tempArr );

                        $log.debug( "Processed tweets are this long: " + tempArr.length );
                        if ( crawlerModel.twitter.length > 2 ) {
                            crawlerModel.twitter = crawlerModel.twitter.slice( 0, 3 );
                        }
                    }

                    return true;

                } )
                .catch( function ( err ) {
                    $log.error( "Shat meeself getting tweets!" );
                    return false;
                } )

        }

        function makeSensibleMessageFrom( msgArray, listing ) {

            msgArray.push( listing.showName );

            //Now, look for team names
            if ( listing.team1 && listing.team2 ) {
                $log.debug( "Adding secondary team entry" );
                msgArray.push( listing.team1 + " v " + listing.team2 );
            }

        }

        function getTVGrid() {

            return ogAPI.getGridForDevice()
                .then( function ( grid ) {
                    // { nowPlaying: 'Title', grid: { channel: <channel>, lisitings: [ <listingobjects> ] }
                    $log.debug( "Got the grid" );

                    if ( !grid ) {
                        $log.debug( "Grid returned undefined, blanking Vert scroller" );
                        $scope.vertMessages = [];
                    } else {

                        var newVerts = [];
                        newVerts.push( { header: 'On Now', messages: [ grid.listings[ 0 ].showName ] } );

                        // Remove the first listing
                        grid.listings.shift();

                        var nupMsgs = [];
                        grid.listings.forEach( function ( listing ) {
                            makeSensibleMessageFrom( nupMsgs, listing );
                        } );
                        newVerts.push( { header: 'Coming Up', messages: nupMsgs } );
                        $scope.vertMessages = newVerts;


                    }


                } );

        }

        $scope.$on( 'HZ_CRAWLER_START', function () {
            $log.debug( "Got a cralwer start message" );
            updateDisplay();
        } );

        $scope.$on( 'VERT_RELOAD_INTERVAL', function () {
            $log.debug( 'Got Vert reload request' );
            getTVGrid();
        } );

        function inboundAppMessage( msg ) {
            $log.info( "New app message: " + msg );
        }

        function inboundSysMessage( msg ) {
            $log.info( "New sys message: " + msg );
        }

        function initialize() {
            ogAPI.init( {
                appName:             "io.ourglass.ogcrawler",
                appType:             "tv",
                deviceModelCallback: deviceModelUpdate,
                venueModelCallback:  venueModelUpdate,
                appMsgCallback:      inboundAppMessage,
                sysMsgCallback:      inboundSysMessage,
                // mock: {
                //     deviceUDID: 'c18597f5-e942-47f7-840c-2ce3a4a8aacc',
                //     venueUUID:  '1bb1793e-43cb-4c78-b3c2-40bbfc86e71d'
                // }
            } )
                .then( function ( data ) {
                    $log.debug( "crawler: init complete" );

                    _useVenueData = true; //data.device && data.device.useVenueData;
                    _venueData = data.venue;
                    _deviceData = data.device;

                    updateDisplay();

                    // if ( data.twitterQueries ) {
                    //     // TODO This is gross because it runs a tweet grab immediately
                    //     ogAPI.updateTwitterQuery( _sourceData.twitterQueries )
                    //         .then( function ( d ) {
                    //             $log.debug( "Successfully updated twitter queries" );
                    //         } )
                    //         .catch( function ( e ) {
                    //             $log.error( e.message );
                    //         } )
                    // }
                } )
                .catch( function ( err ) {
                    $log.error( "crawler: something bad happened: " + err );
                } );
        }

        // $interval(getTVGrid, 1000*60*5); // get tv grid every 5 min
        // getTVGrid();

        initialize();

        ogAPI.getGridForCurrentChannel()
            .then( function ( info ) {
                if ( !info ) {
                    $log.debug( "No channel info" );
                } else {
                    $log.debug( info );
                }
            } )

    } );


// $scope.vertMessages = [
//     { header: 'Now Showing', messages: ['Football', '49ers v Rams' ]},
//     { header: 'Coming Up', messages: [ 'Soccer', 'Quakes v Patriots', 'SportsCenter' ] }
// ];
//
// $timeout(function(){
//
//     $scope.vertMessages = [
//         { header: 'Now Showing', messages: [ 'Movie', 'The Commitments' ] },
//         { header: 'Coming Up', messages: [ 'Blues', 'The Penguins', 'Turtle Race' ] }
//     ];
//
// }, 20000);
//
// $timeout( function () {
//
//     $scope.vertMessages = [
//         { header: 'Splought', messages: [ 'Some Shit', 'Cock Commitments' ] },
//         { header: 'Franlin', messages: [ 'serft', 'The Treywert', 'Tanhue Uilo' ] }
//     ];
//
// }, 45000 );

// $scope.crawlerMessages = [
//     { text: "I am message number one and should be red!", style: { color: '#FF0000' } },
//     { text: "I am message number deux and should be blue!", style: { color: '#0000FF' } },
//     { text: "I am message number three and should be green!", style: { color: '#00FFFF' } },
// ];
//
// $timeout( function () {
//     $scope.crawlerMessages = [
//         { text: "I am message number one A and should be red!", style: { color: '#FF0000' } },
//         { text: "I am message number deux B and should be blue!", style: { color: '#0000FF' } },
//         { text: "I am message number three C and should be green!", style: { color: '#00FFFF' } },
//     ];
//
// }, 10000 );
