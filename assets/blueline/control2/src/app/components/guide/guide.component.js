/*********************************

 File:       guide.component.js
 Function:   Manager Guide Component
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './guide.scss' );

// Let the ngTemplate-loader deal with the required images automatically, rather than requiring every one.
let template = require( 'ngtemplate-loader!html-loader!./guide.template.html' );

const TEST_MODE = true;
const WINDOW_SIZE = 30; //Predefined window size that does not change


class GuideController {
    constructor( $log, $rootScope, uibHelper, $timeout, $state, ogAPI, $filter ) {
        this.$log = $log;
        this.$log.debug( 'loaded GuideController' );
        this.$rootScope = $rootScope;
        this.uibHelper = uibHelper;
        this.$timeout = $timeout;
        this.$state = $state;
        this.ogAPI = ogAPI;
        this.ogSystem = this.ogAPI.getOGSystem();
        if (TEST_MODE) this.ogSystem.isPaired = true;
        this.$filter = $filter;

        this.listenerUnsub = this.$rootScope.$on(
            "NEW_PROGRAM",
            () => {
                this.$log.debug( "TV PROGRAM CHANGE" );
                this.uibHelper.dismissCurtain();
            }
        );

        // From port
        this.ui = { loadError: false, refineSearch: 'all' };
        // $scope.ui = { loadError: false, refineSearch: 'all', isPaired: true }; // I did this so I could get listings on my laptop

        this.slideIndex = 0; //renamed this from slideIdx so I could think about it better
        this.displayedGrid = []; //The grid we are actually displaying
        this.scrollLimits = { top: true, bottom: false }; //Where to limit scroll, starting at top we don't want up scroll but do want down

        this.atEdge = this.atEdge.bind(this); // called from outside object

    }



    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.filterGrid();
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.listenerUnsub(); // unsub $on listener
    }

    refineSearchFilter( inputArray ) { //Refines our search filter

        switch ( this.ui.refineSearch ) { //Switch over favorites, sports, news, or all / default

            // case 'favorites': //Not really implemented yet
            //     return _.filter( inputArray, function ( gentry ) {
            //         return gentry.channel.favorite;
            //     } );

            case 'sports': //If it's sports, filter by Sports (to get sports channels)
                return this.$filter( 'filter' )( inputArray, 'Sports' );

            case 'news': //If it's news, filter by News (to get news channels)
                return this.$filter( 'filter' )( inputArray, 'News' );

            case 'all':
            default:
                return inputArray;

        }
    }

    filterGrid(){

        let channelFiltered = this.$filter( 'filter' )( this.grid, this.stationSearch ); //Angular's filter of the full grid when searching
        let refineFiltered = this.refineSearchFilter( channelFiltered ); //Filter more if someone selected a certain type of filter
        this.displayedGrid = refineFiltered.slice( this.slideIndex, WINDOW_SIZE + this.slideIndex ); //Display a section from the current index to the next 30 (+ index) items
        this.scrollLimits.top = !this.slideIndex;  //at top when index is 0 (slideIndex is falsy at 0)
        this.scrollLimits.bottom = ( this.slideIndex >= refineFiltered.length - WINDOW_SIZE ); //Make sure it's not at the bottom of the list

    }

    refineSearch( searchType ) { //Changes refine search type for refineSearchFilter
        this.ui.refineSearch = searchType; //sets refineSearchFilter's filter string to searchType
        this.slideIndex = 0; //Sets slide index back to 0 (moving to the top)
        this.filterGrid(); //Filter the grid based on new filter
    }

    imageSearch( imageSearch ) {
        this.stationSearch = imageSearch; //Sets search to image text
    }

    clearSearch () {
        this.stationSearch = ""; //Clears search
    }


    atEdge( edge ) { //This function is passed to the scrollWindow controller

        this.$log.debug( "In controller @ edge: " + edge ); //We are at the edge and need to load more content
        if ( edge === 'end' ) { //If the edge is the end of the list we don't load anything and just increase the index by 1
            this.slideIndex = this.slideIndex + 1; //Just keep going until we find a load-triggering location
        } else {
            //If we aren't at the end
            if ( !this.slideIndex ) //If we are at the top of our list
                return; //Return
            this.slideIndex = this.slideIndex - 1; //Otherwise, we're moving up and need to keep increasing the slide index
            if ( this.slideIndex <= 0 ) { //Unless we are now <= 0
                this.slideIndex = 0; //Then just set it to zero
            }
        }

        this.filterGrid(); //Filter the grid

    };


    // injection here
    static get $inject() {
        return [ '$log', '$rootScope', 'uibHelper', '$timeout', '$state', 'ogAPI', '$filter' ];
    }
}

export const name = 'guideComponent';

const Component = {
    $name$:       name,
    bindings:     { grid: '<', permissions: '<', currentProgram: '<' },
    controller:   GuideController,
    controllerAs: '$ctrl',
    templateUrl:  template
};

export default Component


