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

        $scope.vertMessages = [];
        $scope.crawlerMessages = [];

        var crawlerModel = {
            user:    [],
            twitter: [],
            ads:     []
        };

        //function to set the display messages to the randomized concatenation of user and twitter messages
        //and coming up
        function updateDisplay() {

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

        function modelUpdate( data ) {
            $log.debug( "crawler: got a model update!" );
            crawlerModel.user = data.messages;
            updateDisplay();
        }

        function reloadTweets() {

            $log.debug( "Grabbing tweets" );
            return $q.all( [ ogAPI.getTweets(), ogAPI.getChannelTweets() ] )
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
                        if (crawlerModel.twitter.length>2){
                            crawlerModel.twitter = crawlerModel.twitter.slice(0,3);
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

            return ogAPI.getGridForCurrentChannel()
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

        function inboundMessage( msg ) {
            $log.info( "New message: " + msg );
        }

        function initialize() {
            ogAPI.init( {
                appName:         "io.ourglass.ogcrawler",
                appType:         "tv",
                modelCallback:   modelUpdate,
                messageCallback: inboundMessage
            } )
                .then( function ( data ) {
                    $log.debug( "crawler: init complete" );
                    crawlerModel.user = data.messages;
                    updateDisplay();
                    if ( data.twitterQueries ) {
                        // TODO This is gross because it runs a tweet grab immediately
                        ogAPI.updateTwitterQuery( data.twitterQueries )
                            .then( function ( d ) {
                                $log.debug( "Successfully update twitter queries" );
                            } )
                            .catch( function ( e ) {
                                $log.error( e.message );
                            } )
                    }
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
