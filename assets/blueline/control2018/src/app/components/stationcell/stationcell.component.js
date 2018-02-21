/*********************************

 File:       stationcell.component.js
 Function:   Station Cell Component
 Copyright:  Ourglass TV
 Date:       2/8/18 1:11 AM
 Author:     mkahn


 **********************************/

import moment from 'moment'

require( './stationcell.scss' );
require( './default_station_logo.png');

const SAFETY_HUD_DISMISS_DELAY = 5000;

class StationCellController {
    constructor( $log, ogAPI, cntrlSvc, uibHelper, $timeout ) {

        this.$log = $log;
        this.$log.debug( 'loaded StationCellController' );
        this.ogAPI = ogAPI;
        this.cntrlSvc = cntrlSvc;
        this.uibHelper = uibHelper;
        this.$timeout = $timeout;

    }

    changeChannel() {

        if (this.nowPlaying) return; // this is the now playing header.
        // This is dismissed when the channel change is picked up by the cloud and fed back down through sockeio,
        // or the safety timer goes.
        const hud = this.uibHelper.curtainModal( 'Changing...' );
        this.$timeout(()=>hud.dismiss(), SAFETY_HUD_DISMISS_DELAY);
        this.$log.debug( "Changing channel to: " + this.channelGrid.channel.channelNumber );
        this.ogAPI.changeChannel( this.channelGrid.channel.channelNumber );
        //$rootScope.currentChannel = scope.grid;
        //$timeout(function(){ hud.dismiss() }, 5000);

    }

    // timeStr is utc time, so we need to add the proper offset for our TZ
    // For now, we'll just hack it
    displayTime( timeStr ) {
        //var parsedTimeStr = moment(timeStr); //Use Moment.js to parse
        const parsedTimeStr = moment( timeStr + 'Z' ); // make UTC since it comes with no TZ info
        const date = parsedTimeStr.toDate();
        const hour = (date.getHours() > 12 ? date.getHours() - 12 : date.getHours());
        const min = date.getMinutes();

        if ( isNaN( hour ) ) return "On Later";
        return hour + ':' + (min < 10 ? '0' + min : min);
    };

    favoriteChannel(){

        if (this.cntrlSvc.isFavoriteChannel( this.channelGrid.channel.number )){
            this.uibHelper.confirmModal("Are you sure?", "Do you want to remove this channel from favorites?", true)
                .then(()=> this.cntrlSvc.toggleFavoriteChannel( parseInt( this.channelGrid.channel.channelNumber ) ))
                .catch(()=> this.uibHelper.dryToast("Just checking....", 1000))
        } else {
            this.cntrlSvc.toggleFavoriteChannel( parseInt( this.channelGrid.channel.channelNumber ) );
        }

    }


    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', 'ControlAppService', 'uibHelper', '$timeout' ];
    }
}

export const name = 'stationCell';

const Component = {
    $name$:       name,
    bindings:     { nowPlaying: '<', channelGrid: '<', search: '<' },
    controller:   StationCellController,
    controllerAs: '$ctrl',
    template:     `
<div ng-class="$ctrl.nowPlaying ? 'now-playing' : 'station-cell'" ng-click="$ctrl.changeChannel()" ng-hide="$ctrl.nowPlaying && $ctrl.search">

    <div class="station-left-col">
        <div class="station-logo-holder">
            <img class="station-icon" og-fallback-img="images/default_station_logo.png"
                 ng-src="{{$ctrl.channelGrid.channel.logoUrl}}"/>
        </div>
        <!--<p>{{$ctrl.search}}</p>-->
    </div>

    <div class="station-right-col">

        <div class="flex">

            <div class="channel-name" ng-if="$ctrl.channelGrid.channel.callsign">
                {{ $ctrl.channelGrid.channel.callsign }} - {{ $ctrl.channelGrid.channel.channelNumber}}
            </div>

            <div class="channel-name" ng-if="!$ctrl.channelGrid.channel.callsign">
                {{ $ctrl.channelGrid.channel.channelNumber}}
            </div>

            <div ng-if="!$ctrl.nowPlaying" class="favorites-box" ng-click="$ctrl.favoriteChannel(); $event.stopPropagation();">
                <i ng-if="$ctrl.cntrlSvc.isFavoriteChannel($ctrl.channelGrid.channel.number)" class="glyphicon glyphicon-heart"></i>
                <i ng-if="!$ctrl.cntrlSvc.isFavoriteChannel($ctrl.channelGrid.channel.number)" class="glyphicon glyphicon-heart-empty"></i>
            </div>

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
            <div class="flex" ng-if="$ctrl.search" ng-repeat="listing in $ctrl.channelGrid.listings | filter: $ctrl.search">
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
