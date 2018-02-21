/*********************************

 File:       controlapp.service.js
 Function:   Core app functions
 Copyright:  Ourglass TV
 Date:       2/8/18 12:25 AM
 Author:     mkahn

 Handles all the app state.

 **********************************/

import Globals from '../globals'
import Promise from 'bluebird'
import _ from 'lodash'

// TODO: this is a hack and should be fetched from PGS for the lineup
const DEFAULT_FAV_CHANNELS = [ 202, 206, 207, 208, 209, 212, 213, 215, 216, 217, 218, 219,
220, 221, 277, 281, 282, 331, 355, 356, 605, 606, 614, 618, 620 ];

const AUTO_LISTINGS_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DO_PERIODIC_REFRESH = true;

export default class ControlAppService {

    constructor( ogAPI, $log, $rootScope, uibHelper, $state, $http, $timeout ) {

        this.ogAPI = ogAPI;
        this.$log = $log;
        this.$rootScope = $rootScope;
        this.uibHelper = uibHelper;
        this.$state = $state;
        this.$http = $http;
        this.$timeout = $timeout;

        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );
        this.periodicListingsRefresher = this.periodicListingsRefresher.bind(this);

        // use this promise to ensure initialization is done.
        this.initComplete = this.ogAPI.init( {
            appType:             'mobile',
            appId:               'io.ourglass.ogcontrol',
            deviceModelCallback: this.deviceModelUpdate,
            venueModelCallback:  this.venueModelUpdate,
            appMsgCallback:      this.appMsgCallback,
            sysMsgCallback:      this.sysMsgCallback,
            venueMsgCallback:    this.venueMsgCallback
        } )
            .then( ( modelData ) => {
                this.deviceModel = modelData.device;
                this.venueModel = modelData.venue;
                this.user = modelData.user;
                return this.ogAPI.getOGDeviceModel();
            } )
            .then( (ogdevice) => {
                this.ogdevice = ogdevice;
                this.currentProgram = ogdevice.currentProgram;
                return this.fetchAllListings();
            })
            .then(()=>{

                if (!this.ogAPI.venueModel.favoriteChannels || !this.ogAPI.venueModel.favoriteChannels.length){
                    this.ogAPI.venueModel.favoriteChannels = DEFAULT_FAV_CHANNELS;
                    this.ogAPI.saveVenueModel();
                    this.uibHelper.headsUpModal( "Hey There!", "We've released a new version of the control app for your viewing pleasure!\n\n This version let's you set up favorite channels and has better search features.\n\n Enjoy!" )
                        .then( () => {} )
                        .catch( () => {} );
                }
                this.hideTabs = false;
                // Here for testing
                // this.ogAPI.venueModel.favoriteChannels = null;
                // this.ogAPI.saveVenueModel();
                this.$state.go( 'dash' );
                this.$timeout( this.periodicListingsRefresher, AUTO_LISTINGS_REFRESH_INTERVAL );

            })
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
                this.uibHelper.headsupModal( 'Init Fail', 'This is an unrecoverable failure calling init.\n' + err.data.error )
                    .then( () => {} )
                    .catch( () => {} );
            } );

        this.hideTabs = true;
        this.hideLoDefChannels = false;  // the data from TVMedia.ca is NOT accurate as to which are HD. Leaving the code in for later.

    }

    deviceModelUpdate(deviceModel){
        this.$log.debug('Got device model update');
    }

    venueModelUpdate(venueModel) {
        this.$log.debug( 'Got venue model update' );
    }

    appMsgCallback(appMsg){
        this.$log.debug( 'Got app message' );
    }

    sysMsgCallback( sysMsg ) {
        this.$log.debug( 'Got sys message' );
        if ( sysMsg.action === 'new-program' ) {
            this.currentProgram = JSON.parse(sysMsg.program);
            this.setCurrentProgramGrid();
            this.$rootScope.$broadcast( 'NEW_PROGRAM', sysMsg.program );
        }
    }

    venueMsgCallback( sysMsg ) {
        this.$log.debug( 'Got venue message' );
    }


    toggleMasquerade() {
        this.isMasqueradingAsPatron = !this.isMasqueradingAsPatron;
        this.$rootScope.$broadcast( 'MASQUERADE_MODE_CHANGE', { isMasquerading: this.isMasqueradingAsPatron } );
        return this.isMasqueradingAsPatron;
    }

    fetchAllListings(){

        let promise;

        if ( Globals.mockProgramGuide ) {
            promise = this.$http.get( 'json/mockguide.json' ).then( ( data ) => data.data );
        } else {
            promise = this.ogAPI.getGrid();
        }

        return promise.then((newGrid)=>{
            this.currentGrid = newGrid;
            this.setCurrentProgramGrid();
            return this.currentGrid;
        });
    }

    getAllListings( forceRefresh ){

        if (this.currentGrid && !forceRefresh)
            return Promise.resolve(this.currentGrid);

        return this.fetchAllListings();

    }


    periodicListingsRefresher(){

        // if (DO_PERIODIC_REFRESH){
        //     this.fetchAllListings()
        //         .then( ( newListings ) => {
        //             this.$rootScope.$broadcast( 'NEW_LISTINGS', newListings );
        //         } );
        //
        //
        // }
        //
        //
        // if (this.doPeriodicRefresh){
        //     this.$timeout(this.periodicListingsRefresher, AUTO_LISTINGS_REFRESH_INTERVAL );
        // }
    }

    setCurrentProgramGrid(){
        console.log("Setting currentProgramGrid");
        const haveCurrentChannel = this.currentProgram && this.currentProgram.channelNumber;
        console.log("haveCurrentChannel is "+haveCurrentChannel);
        if (!haveCurrentChannel) { //throw new Error('No channel number in the cloud!');
            console.error("Nulling currentProgramGrid");
            this.currentProgramGrid = null;
        } else {
            this.currentProgramGrid = _.find( this.currentGrid, { channel: { channelNumber: parseInt(haveCurrentChannel) } } );
            console.log( "Set currentProgramGrid to: " + this.currentProgramGrid );
        }

    }

    toggleFavoriteChannel(channelNum){

        if (this.isFavoriteChannel(channelNum)){
            _.pull(this.ogAPI.venueModel.favoriteChannels, channelNum);
        } else { //add
            this.ogAPI.venueModel.favoriteChannels.push(channelNum);
        }

        this.ogAPI.venueModel.favoriteChannels.sort( ( a, b ) => a - b );
        this.ogAPI.saveVenueModel();
        this.$rootScope.$broadcast( 'FAVS_CHANGED' );

    }

    isFavoriteChannel(channelNum){
        if (!this.ogAPI.venueModel.favoriteChannels) return false;
        return this.ogAPI.venueModel.favoriteChannels.indexOf(parseInt(channelNum)) > -1;
    }

    static get $inject() {
        return [ 'ogAPI', '$log', '$rootScope', 'uibHelper', '$state', '$http', '$timeout' ];
    }

    static get serviceName(){
        return 'ControlAppService';
    }

}

