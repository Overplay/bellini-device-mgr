/*********************************

 File:       stationcell.component.js
 Function:   Station Cell Component
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

require( './stationcell.scss' );
require( './default_station_logo.png');


class StationCellController {
    constructor( $log, ogAPI ) {

        this.$log = $log;
        this.$log.debug( 'loaded StationCellController' );
        this.ogAPI = ogAPI;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

    }

    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );

    }

    changeChannel() {

        const hud = uibHelper.curtainModal( 'Changing...' );
        this.$log.debug( "Changing channel to: " + this.channelGrid.channel.channelNumber );
        this.ogAPI.changeChannel( this.channelGrid.channel.channelNumber );
        //$rootScope.currentChannel = scope.grid;
        //$timeout(function(){ hud.dismiss() }, 5000);

    }


    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', 'ControlAppService' ];
    }
}

export const name = 'stationCell';

const Component = {
    $name$:       name,
    bindings:     { nowPlaying: '<', channelGrid: '<', search: '<' },
    controller:   StationCellController,
    controllerAs: '$ctrl',
    template:     `
<div ng-class="$ctrl.nowPlaying ? 'now-playing' : 'station-cell'" ng-click="$ctrl.changeChannel()">

    <div class="station-left-col">
        <div class="station-logo-holder">
            <img class="station-icon" og-fallback-img="images/default_station_logo.png"
                 ng-src="{{$ctrl.channelGrid.channel.logoUrl}}"/>
        </div>
    </div>

    <div class="station-right-col">

        <div class="flex">

            <div class="channel-name" ng-if="$ctrl.channelGrid.channel.callsign">
                {{ $ctrl.channelGrid.channel.callsign }} - {{ $ctrl.channelGrid.channel.channelNumber}}
            </div>

            <div class="channel-name" ng-if="!$ctrl.channelGrid.channel.callsign">
                {{ $ctrl.channelGrid.channel.channelNumber}}
            </div>

            <!-- <div ng-hide="nowPlaying" class="favorites-box" ng-click="favoriteChannel( grid.channel ); $event.stopPropagation();">
                <i ng-if="grid.channel.favorite" class="glyphicon glyphicon-heart"></i>
                <i ng-if="!grid.channel.favorite" class="glyphicon glyphicon-heart-empty"></i>
            </div> -->

        </div>
        <div class="flex flex-col">

            <div class="flex">
                <div class="listing-time" ng-if="!$ctrl.search">On Now</div>
                <div class="listing-name" ng-if="$ctrl.channelGrid.listings.length == 0 && !$ctrl.search">
                    Unknown
                    Programming
                </div>

                <div class="listing-name" ng-hide="$ctrl.channelGrid.listings.length == 0 || $ctrl.search">
                    {{ $ctrl.channelGrid.listings[0] | smartTitle }}
                </div>
            </div>
            <div class="flex" ng-if="search" ng-repeat="listing in $ctrl.channelGrid.listings | filter: $ctrl.search">
                <div class="listing-time">
                    {{ $ctrl.displayTime(listing.listDateTime) }}
                </div>
                <div class="listing-name">
                    {{ listing | smartTitle }}
                </div>
            </div>


        </div>
    </div>
    
</div>
`
};

export default Component
