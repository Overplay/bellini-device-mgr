/*********************************

 File:       guide.component.js
 Function:   Manager Guide Component
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

import _ from 'lodash';

require( './guide.scss' );

// Let the ngTemplate-loader deal with the required images automatically, rather than requiring every one.
let template = require( 'ngtemplate-loader!html-loader!./guide.template.html' );

const TEST_MODE = true;
const WINDOW_SIZE = 30; //Predefined window size that does not change


class GuideController {
    constructor( $log, $rootScope, uibHelper, $timeout, $state, ogAPI, $filter, cappSvc ) {
        this.$log = $log;
        this.$log.debug( 'loaded GuideController' );
        this.$rootScope = $rootScope;
        this.uibHelper = uibHelper;
        this.$timeout = $timeout;
        this.$state = $state;
        this.ogAPI = ogAPI;
        this.ogSystem = this.ogAPI.getOGSystem();
        if ( TEST_MODE ) this.ogSystem.isPaired = true;
        this.$filter = $filter;
        this.cappSvc = cappSvc;

        this.filterGrid = this.filterGrid.bind(this);

        this.listenerUnsubs = [
            this.$rootScope.$on( "NEW_PROGRAM", () => this.uibHelper.dismissCurtain()),
            this.$rootScope.$on( 'FAVS_CHANGED', () => {
                this.filterGrid();
            } )
        ];

        this.noresultsMsg = "No results found";

        // From port
        this.guideView = 'faves';
        this.searchEntry = '';
        // $scope.ui = { loadError: false, refineSearch: 'all', isPaired: true }; // I did this so I could get listings
        // on my laptop

        this.slideIndex = 0; //renamed this from slideIdx so I could think about it better
        this.displayedGrid = []; //The grid we are actually displaying
        this.scrollLimits = { top: true, bottom: false }; //Where to limit scroll, starting at top we don't want up
                                                          // scroll but do want down

        this.atEdge = this.atEdge.bind( this ); // called from outside object

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.nowPlayingGrid = this.cappSvc.currentProgramGrid;
        this.filterGrid();
    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
        this.listenerUnsubs.forEach(u=>u()); // unsub $on listeners
    }

    setGuideView( view ) {
        this.guideView = view;
        this.filterGrid();
    }


    applyFiters( inputArray ) {

        const searchUp = this.searchEntry.toUpperCase();

        const matchesChannel = _.filter( inputArray, ( test ) => test.channel.number.startsWith( this.searchEntry ) );

        const matchesNetwork = _.filter( inputArray, ( test ) => {
            const netUp = test.channel.network.toUpperCase();
            const callUp = test.channel.callsign.toUpperCase();
            return callUp.startsWith( searchUp ) || netUp.startsWith( searchUp );
        } );

        // TODO this is DIRTY
        const matchesProgramming = _.filter( inputArray, ( test ) => {

            let hit = false;
            test.listings.some( ( l ) => {
                const descUp = l.description.toUpperCase();
                const showNameUp = l.showName.toUpperCase();
                const showType = l.showType.toUpperCase();
                const teams = (l.team1 + l.team2).toUpperCase();
                hit = descUp.indexOf( searchUp ) > -1 ||
                    showNameUp.indexOf( searchUp ) > -1 ||
                    showType.indexOf( searchUp ) > -1 ||
                    teams.indexOf( searchUp ) > -1;
                return hit;
            } );

            return hit;

        } );

        return _.concat( matchesChannel, matchesNetwork, matchesProgramming );

    }

    filterGrid() {

        let outputArray;

        const processGrid = this.guideView === 'all' ? this.grid : _.filter( this.grid, ( test ) => this.cappSvc.isFavoriteChannel( test.channel.number ) );

        if ( !this.searchEntry ) {
            outputArray = processGrid;
        } else {

            outputArray = this.applyFiters( processGrid );

            this.noresultsMsg = "No results";

            if ( !outputArray.length && this.guideView === 'faves' ) {
                // no results in faves, let's check all
                if ( this.applyFiters( this.grid ).length ) {
                    this.uibHelper.dryToast( "No results in Favorites, switched to All channels.", 10000 );
                    this.setGuideView( 'all' );
                }
            }
        }


        // let channelFiltered = this.$filter( 'filter' )( this.grid, this.stationSearch ); //Angular's filter of the
        // full grid when searching let refineFiltered = this.refineSearchFilter( channelFiltered ); //Filter more if
        // someone selected a certain type of filter
        this.displayedGrid = outputArray.slice( this.slideIndex, WINDOW_SIZE + this.slideIndex ); //Display a section
                                                                                                  // from the current
                                                                                                  // index to the next
                                                                                                  // 30 (+ index) items
        this.scrollLimits.top = !this.slideIndex;  //at top when index is 0 (slideIndex is falsy at 0)
        this.scrollLimits.bottom = ( this.slideIndex >= outputArray.length - WINDOW_SIZE ); //Make sure it's not at the
                                                                                            // bottom of the list

    }

    imageSearch( imageSearch ) {
        this.searchEntry = imageSearch; //Sets search to image text
        this.filterGrid();
    }

    clearSearch() {
        this.searchEntry = ""; //Clears search
        this.filterGrid();
    }


    atEdge( edge ) { //This function is passed to the scrollWindow controller

        this.$log.debug( "In controller @ edge: " + edge ); //We are at the edge and need to load more content
        if ( edge === 'end' ) { //If the edge is the end of the list we don't load anything and just increase the index by 1
            this.slideIndex = this.slideIndex + 1; //Just keep going until we find a load-triggering location
        } else {
            //If we aren't at the end
            if ( !this.slideIndex ) //If we are at the top of our list
                return; //Return
            this.slideIndex = this.slideIndex - 1; //Otherwise, we're moving up and need to keep increasing the slide
                                                   // index
            if ( this.slideIndex <= 0 ) { //Unless we are now <= 0
                this.slideIndex = 0; //Then just set it to zero
            }
        }

        this.filterGrid(); //Filter the grid

    };


    // injection here
    static get $inject() {
        return [ '$log', '$rootScope', 'uibHelper', '$timeout', '$state', 'ogAPI', '$filter', 'ControlAppService' ];
    }
}

export const name = 'guideComponent';

const Component = {
    $name$:       name,
    bindings:     { grid: '<', permissions: '<' },
    controller:   GuideController,
    controllerAs: '$ctrl',
    templateUrl:  template
};

export default Component


