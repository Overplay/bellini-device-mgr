import _ from 'lodash'


import {name as GameplayState} from '../components/gameplay/gameplay.component'
import {name as LobbyState} from '../components/lobby/lobby.component'
import {name as RegState} from '../components/registration/registration.component'

const STUB_REALTIME = true;


//let _playerName = 'Chibert'; //testing
//let _myHand;
// let this.myPlayer;
// let this.judgeName;
//let this.blackCard;
//let this.isRegistered = false; //testing
//let this.upstreamGameState = null;
//let this.isWatching = false;

// Struggling with whether to control the UI thru the service, or let the Views do the work...
// const UI_STATES = [ 'connecting', 'registration', 'ask2watch', 'watching', 'playingwhite', 'playingblack',
// 'endslate']; let _uiState = 'connecting';

export default class SqControlService {

    constructor( $log, ogAPI, $rootScope, $timeout, $state, $sce, uibHelper ) {
        $log.debug( "Constructing CahControlService" );
        this.$log = $log;
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$state = $state;
        this.$sce = $sce;
        this.uibHelper = uibHelper;


        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );

        this.initComplete = this.ogAPI.init( {
            appType:             'control',
            appId:               'io.ourglass.squares',
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
                this.processModel();
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
                this.uibHelper.headsupModal('Init Fail', 'This is an unrecoverable failure calling init.\n'+err.data.error)
                    .then(()=>{})
                    .catch(()=>{});
            } );

        //this.uiStateUpdate();
    }

    deviceModelUpdate( model ) {
        this.deviceModel = model;
    }

    venueModelUpdate( model ) {
        this.$log.debug( '===> Venue Model Update.' );
        this.venueModel = model;
        this.processModel();
    }

    processModel() {

        // check if already registered, if so process it
        if (this.venueModel.players){
            this.myPlayer = _.find(this.venueModel.players, (p)=>p.uuid === this.userUUID);
        }

        if ( this.venueModel.state !== this.upstreamGameState ) {
            this.$log.debug( '===> Venue Model Game State CHANGE to: ' + this.venueModel.gameState );
            this.upstreamGameState = this.venueModel.gameState;
            this.gameStateChange();
        }
    }

    appMsgCallback( data ) {
        this.$log.debug( "AppMessage: " + data );

        if ( data.action ) {
            switch ( data.action ) {
                case 'GAME_STATE':
                    this.$log.debug( 'GAME_STATE message received with state: ' + data.state );
                    // Now handled only thru model change so data is up to date when msg received
                    //this.gameStateChange( data.state );
                    // This is a different Message than GAME_STATE. GAME_STATE is triggerred from venueData
                    // and is guaranteed to have the right model data. This is NOT and is a kind of FYI message.
                    // It is used in the Lobby controller to check for connectivity.
                    this.$rootScope.$broadcast( 'GAME_STATE_MSG', data );
                    break;


                case 'REGISTRATION_SUCCESS':
                    this.$log.debug( 'REGISTRATION_SUCCESS message received' );
                    const inboundUUID = data.player && data.player.uuid;
                    if ( inboundUUID === this.userUUID ) {
                        this.$rootScope.$broadcast( 'REGISTRATION_SUCCESS', data );
                        this.myPlayer = data.player;
                        this.isRegistered = true;
                    } else {
                        this.$log.debug( '>>> Message not for me' );
                    }

                    break;

                case 'REGISTRATION_FAILURE':
                    this.$log.debug( 'REGISTRATION_FAILURE message received' );
                    const fUUID = data.uuid;
                    if ( fUUID === this.userUUID ) {
                        this.myPlayer = null;
                        this.isRegistered = false;
                        this.$rootScope.$broadcast( 'REGISTRATION_FAILURE', data );
                    } else {
                        this.$log.debug( '>>> message not for me' );
                    }
                    break;

                case 'WINNER_PICKED':
                    this.$log.debug( 'WINNER_PICKED message received' );
                    this.$rootScope.$broadcast( 'WINNER_PICKED', data );
                    break;

                default:
                    this.$log.error( 'BAD ACTION RECEIVED in appMsgCallback' );
            }
        }
    }

    sysMsgCallback( data ) {
        this.sysMsg = data;
    }

    venueMsgCallback( data ) {
        this.venueMsg = data;
    }


    gameStateChange() {
        this.$log.debug( 'State change. New state: ' + this.upstreamGameState );
        this.$rootScope.$broadcast( 'GAME_STATE', { state: this.upstreamGameState } );

        // Master controlled state changes
        switch ( this.upstreamGameState ) {

            case 'reset':
                this.$log.debug( 'TV side is in registration state' );
                this.myPlayer = null;
                this.isRegistered = false;
                window.sessionStorage.clear();
                this.$state.go( LobbyState );
                break;

            case 'registration':
                this.$log.debug( 'TV side is in registration state' );

                if ( this.alreadyRegistered ) {
                    this.$log.debug( 'Got registration state message from upstream, but already regged...' );
                    this.$state.go( RegState );
                } else {
                    this.$state.go( LobbyState, { state: 'registration' } );
                }
                break;

            case 'running':
                this.$log.debug( 'TV side is in running state' );
                this.$state.go( GameplayState );
                break;


        }
    }

    numOpenSlotChange( numSlots ) {
        this.$rootScope.$broadcast( 'OPEN_SLOTS', { slots: numSlots } );
    }


    register( name ) {
        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTER', name: name, uuid: this.userUUID } );
    }

    unregister() {
        if ( this.myPlayer ) {
            this.ogAPI.sendMessageToAppRoom( {
                action: 'UNREGISTER', player: this.myPlayer
            } );
            this.isRegistered = false;
            this.myPlayer = null;
        } else {
            throw new Error( 'No one registered to unregister, dipshit!' );
        }
    }

    get userUUID(){
        return this.user && this.user.user && this.user.user.uuid;
    }

    checkUpstreamRegistration() {
        this.$log.debug('Checking upstream reg');
        const savedName = window.sessionStorage.getItem('playerName');

        if (!savedName || !this.venueModel.players){
            this.$log.debug('There is no saved name, so we cannot check upstream reg.');
            this.isRegistered = false;
            this.myPlayer = null;
            return false;
        }

        this.myPlayer = _.find(this.venueModel.players, (p)=>{
            return p.name === savedName;
        })

        if (this.myPlayer){
            this.$log.debug('Looks like we are registered!');
            this.isRegistered = true;
        }

        return true;
    }

    get registered() {
        return this.isRegistered;
    }

    get playerName() {
        return this.myPlayer.name;
    }


    get gameState() {
        return this.upstreamGameState;
    }

    get openSlots() {
        return 100 - this.venueModel.players.length;
    }

    get gameInfo(){
        return this.venueModel && this.venueModel.gameInfo;
    }

    get currentQuarter(){
        return this.venueModel && this.venueModel.gameInfo && this.venueModel.gameInfo.quarter;
    }

    get gameIsFinal(){
        return this.venueModel && this.venueModel.final;
    }

    get currentLeader(){
        return this.venueModel && this.venueModel.currentLeader;
    }

    get mySquares(){

        const squares = this.venueModel.squares;
        if (!squares) return [];

        const rval = _.filter(squares, (square)=>{
            const nameMatch = this.myPlayer.name === square.player.name;
            const uuidMatch = this.myPlayer.uuid === square.player.uuid;
            return nameMatch && uuidMatch;
        })

        return rval;

    }

    get currentQuarter(){
        return this.ogAPI.venueModel.gameInfo.quarter;
    }

    /**
     * CENTRALIZED ROUND TIMER
     */
    roundTimerTick() {
        this.roundTimerSec--;
        if ( this.roundTimerSec ) {
            this.roundTimerTimeout = this.$timeout( this.roundTimerTick.bind( this ), 1000 );
        } else {
            this.$log.debug( 'Round timer expired!' );
        }
    }

    killRoundTimer() {
        if ( this.roundTimerTimeout ) this.$timeout.cancel( this.roundTimerTimeout ); //kill olde
    }

    startRoundTimer(seconds) {
        this.killRoundTimer();
        this.roundTimerSec = seconds;
        this.roundTimerTick();
    }


    static get serviceName() {
        return 'SqControlService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout', '$state', '$sce', 'uibHelper' ];
    }
}