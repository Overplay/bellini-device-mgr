/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $filter, ogAPI,
               $rootScope, $location, $anchorScroll) {

        $log.info( "Loading guideController" );

        //$scope.ui = { loadError: false, refineSearch: 'all', isPaired: ogDevice.isPairedToSTB };
        $scope.ui = { loadError: false, refineSearch: 'all', isPaired: true }; // I did this so I could get listings on my laptop

        var slideIndex = 0; //renamed this from slideIdx so I could think about it better
        const WINDOW_SIZE = 30; //Predefined window size that does not change
        var fullGrid = []; //Our grid of channels and listings
        $scope.displayedGrid = []; //The grid we are actually displaying
        $scope.scrollLimits = { top: true, bottom: false }; //Where to limit scroll, starting at top we don't want up scroll but do want down

        $rootScope.currentChannel = {};

        // function getCurrentChannel() {
        //     return ogAPI.getGrid()
        //         .then(function (grid) {
        //             $log.debug("Got the grid and current channel.");
        //             $rootScope.currentChannel = grid.grid;
        //         });
        // }
        //
        // getCurrentChannel();

        /**
         * Load listings from the database
         * 
         */
        function loadListings(){ 
            ogAPI.getGrid() //Make a call to the ogAPI getGrid function
                .then( function ( g ) { //Callback success
                    fullGrid = g; //set internal full grid to grid return

                    var currentChannelNumber = parseInt(ogDevice.currentProgram.channelNumber); //Set current channel to our current channel number
                    $rootScope.currentChannel = _.find( fullGrid, { channel: { channelNumber: currentChannelNumber } } ); //Set scope current channel to loadash channelNumber

                    filterGrid(); //Filter the grid
                } )
                .catch(function(err){
                    $scope.ui.loadError = true; //On error, show ui load error
                })
                .finally( hud.dismiss ); //Dismiss the hud when done
        }

        function refineSearchFilter(inputArray){ //Refines our search filter

            switch ($scope.ui.refineSearch){ //Switch over favorites, sports, news, or all / default
            
                case 'favorites': //Not really implemented yet
                    return _.filter( inputArray, function ( gentry ) {
                        return gentry.channel.favorite;
                    } );
                    
                case 'sports': //If it's sports, filter by Sports (to get sports channels)
                    return $filter('filter')(inputArray, 'Sports');

                case 'news': //If it's news, filter by News (to get news channels)
                    return $filter( 'filter' )( inputArray, 'News' );
            
                case 'all':
                default:
                    return inputArray;
            
            }
        }

        function filterGrid(){

            var channelFiltered = $filter('filter')(fullGrid, $scope.stationSearch); //Angular's filter of the full grid when searching
            var refineFiltered = refineSearchFilter(channelFiltered); //Filter more if someone selected a certain type of filter
            $scope.displayedGrid = refineFiltered.slice(slideIndex, WINDOW_SIZE+slideIndex); //Display a section from the current index to the next 30 (+ index) items
            $scope.scrollLimits.top = !slideIndex;  //at top when index is 0 (slideIndex is falsy at 0)
            $scope.scrollLimits.bottom = ( slideIndex >= refineFiltered.length-WINDOW_SIZE ); //Make sure it's not at the bottom of the list

        }

        $scope.refineSearch = function (searchType) { //Changes refine search type for refineSearchFilter
            $scope.ui.refineSearch = searchType; //sets refineSearchFilter's filter string to searchType
            slideIndex = 0; //Sets slide index back to 0 (moving to the top)
            filterGrid(); //Filter the grid based on new filter
        };

        $scope.atEdge = function(edge){ //This function is passed to the scrollWindow controller
        
            $log.debug("In controller @ edge: "+edge); //We are at the edge and need to load more content
            if (edge=='end'){ //If the edge is the end of the list we don't load anything and just increase the index by 1
                slideIndex = slideIndex + 1; //Just keep going until we find a load-triggering location
            } else { 
                //If we aren't at the end
                if (!slideIndex) //If we are at the top of our list
                    return; //Return
                slideIndex = slideIndex - 1; //Otherwise, we're moving up and need to keep increasing the slide index
                if (slideIndex<=0){ //Unless we are now <= 0 
                    slideIndex = 0; //Then just set it to zero
                }
            }

            filterGrid(); //Filter the grid

        };

        
        if ($scope.ui.isPaired){
        
            var refreshListings = $interval( loadListings, 15 * 1000 ); // $interval to run every 5 min or 300000ms //Logan's note: This is only 15 seconds currently. Made that more clear

            var hud = uibHelper.curtainModal( 'Loading Guide' ); //Show our little curtain
            loadListings(); //Load the listings from the server

            $scope.$on( "$destroy", //Wait until there is a $destroy event on the uibHelper.curtainModal
                function ( event ) { 
                    $interval.cancel(refreshListings); // stop refreshing the listings (this way we don't keep loading over and over)
                    $log.debug( "destroy called - canceled listings refresh $interval" ); 
                }
            );
        }
        
        $scope.$watch('stationSearch', function() { //Watch to see if a change was made to stationSearch model 
            $log.debug("stationSearch Modified - need to reset the scroll position"); 
            $log.debug("slideIdx reset to 0, scrolling to scroller-anchor-top");
            slideIndex = 0; //Reset our location to the top

            $location.hash('scroller-anchor-top'); //Sets location hash to top
            $anchorScroll(); //Scrolls to the location hash

            filterGrid(); //Filter our grid baby
        });

        $scope.clearSearch = function () {
            $scope.stationSearch = ""; //Clears search
            $log.debug("search cleared");
        };

        $scope.imageSearch = function ( imageSearch ) {
            $scope.stationSearch = imageSearch; //Sets search to image text
        };


    } );


// Attributes:
//  windowSize is how big a window to maintain (max)
app.directive('scrollWindow', function($log) {

    return {
        restrict: 'A',
        scope:    {
            edgeCallback: "=",
            limits: "="
            },
        link:     function ( scope, element, attrs ) {

            var myElement = element[ 0 ];
            var kickback = attrs.kickback || myElement.offsetHeight/4;

            var edge;
            var developmentMode = true;

            $log.debug( 'inside scroller windower' );


            // scrollTop = distance content has scrolled. 0 means "at top"
            // offsetHeight = on-screen height of element including border and padding (no margin)
            // scrollHeight = read-only property is a measurement of the height of an element's content,
            // including content not visible on the screen due to overflow. This is how tall the scroller
            // would need to be to fit on-screen without a scroll bar.
            //
            // In the downwards direction, scrollTop can never get to scrollHeight because the formula
            // works like so:
            //                              scrollTop---v
            //                                          |<---- offsetHeight -----|
            // |<----------------------------- scrollHeight -------------------->|
            //
            // So to trigger a load at the bottom, you need to do it no later than:
            //    scrollTop = scrollHeight - offsetHeight  (minus a little guardband)
            
            element.bind( 'scroll', function () {
            
                if (developmentMode){
                    $log.debug( 'scrollHeight - ' + myElement.scrollHeight );
                    $log.debug( 'offsetHeight - ' + myElement.offsetHeight );
                    $log.debug( 'scrollTop - ' + myElement.scrollTop );
                    $log.debug( 'Bottom trigger: ' + (myElement.scrollHeight-kickback/2));
                }
               
                if (myElement.scrollTop==0 && !scope.limits.top){
                    edge = 'top';
                    $log.debug("At top");
                    myElement.scrollTop = myElement.scrollTop + kickback;
                    edgeCb();
                } else if (myElement.scrollTop > (myElement.scrollHeight - myElement.offsetHeight - kickback/2) && !scope.limits.bottom){
                    edge = 'end';
                    $log.debug( "At end" );
                    myElement.scrollTop = myElement.scrollTop - kickback;
                    edgeCb();
                }
                
            } );
            
            function edgeCb(){
                if (scope.edgeCallback){
                
                    scope.$apply( function(){

                        scope.edgeCallback( edge );

                    });
                
                }
            }
        }
    }
});

app.filter('smartTitle', function(){
    return function(listing){

        // Mitch to do: something needs to be done here to check if listing is defined.
        // I'm not sure what this does right now - need to look into it
        if (listing) {
            var title = listing.showName;

            if (listing.team1 && listing.team2) {
                title = title + ": " + listing.team1 + " v " + listing.team2;
            }

            return title;
        }
    }
});