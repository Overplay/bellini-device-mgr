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

const AUTO_LISTINGS_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

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
                this.hideTabs = false;
                this.doPeriodicRefresh = true;
                this.periodicListingsRefresher();
                this.$state.go( 'dash' );
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
                this.uibHelper.headsupModal( 'Init Fail', 'This is an unrecoverable failure calling init.\n' + err.data.error )
                    .then( () => {} )
                    .catch( () => {} );
            } );

        this.hideTabs = true;
        this.hideLoDefChannels = true;

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
            $rootScope.$broadcast( 'NEW_PROGRAM', sysMsg.program );
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
            promise = this.ogAPI.getGridForDevice();
        }

        return promise.then((newGrid)=>{

            let loDefChans;

            if (this.hideLoDefChannels){
                loDefChans = _.filter(newGrid, (listing)=>{
                    let isLD = !listing.channel.stationHD;
                    return isLD;
                });
            }
            this.currentGrid = newGrid;
            return newGrid;
        });
    }

    getAllListings( forceRefresh ){

        if (this.currentGrid && !forceRefresh)
            return Promise.resolve(this.currentGrid);

        return this.fetchAllListings();

    }


    periodicListingsRefresher(){

        this.fetchAllListings()
            .then((newListings)=>{
                this.$rootScope.$broadcast( 'NEW_LISTINGS', newListings );
            });

        if (this.doPeriodicRefresh){
            this.$timeout(this.periodicListingsRefresher, AUTO_LISTINGS_REFRESH_INTERVAL );
        }
    }

    static get $inject() {
        return [ 'ogAPI', '$log', '$rootScope', 'uibHelper', '$state', '$http' ];
    }

    static get serviceName(){
        return 'ControlAppService';
    }

}

