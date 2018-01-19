import _ from 'lodash'

import {name as WatchingState} from '../components/gameplay-watching/gp-watch.component'
import {name as PickingState} from '../components/gameplay-picking/gp-picking.component'
import {name as JudgingState} from '../components/gameplay-judging/gp-judge.component'
import {name as LobbyState} from '../components/lobby/lobby.component'
import {name as RegState} from '../components/registration/registration.component'
import {name as WFRState} from '../components/gameplay-waiting-for-result/gp-wfr.component'

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

export default class CahControlService {

    constructor( $log, ogAPI, $rootScope, $timeout, $state, $sce ) {
        $log.debug( "Constructing CahControlService" );
        this.$log = $log;
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$state = $state;
        this.$sce = $sce;


        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );

        this.ogAPI.init( {
            appType:             'control',
            appId:               'io.ourglass.cah',
            deviceModelCallback: this.deviceModelUpdate,
            venueModelCallback:  this.venueModelUpdate,
            appMsgCallback:      this.appMsgCallback,
            sysMsgCallback:      this.sysMsgCallback,
            venueMsgCallback:    this.venueMsgCallback
        } )
            .then( ( modelData ) => {
                this.deviceModel = modelData.device;
                this.venueModel = modelData.venue;
                this.processModel();
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
            } );

        //this.uiStateUpdate();
    }

    extractHand() {

        if (!this.myPlayer){
            this.$log.debug("We don't look registered, checking");
            this.checkUpstreamRegistration();
        }

        if ( this.venueModel.players && this.venueModel.players.length ) {
            this.$log.debug( "Extracting hand info" );
            if ( this.myPlayer ) {
                const p = _.find( this.venueModel.players, { name: this.myPlayer.name } );
                if ( p ) {
                    this.myPlayer = p; //full player
                    this.myHand = p.hand;
                    this.isRegistered = true; // used to check reg status on disconnect
                }
            }
            this.blackCard = this.venueModel.blackCard; //convenience
            this.judgeName = this.venueModel.judge && this.venueModel.judge.name;
            this.playedWhiteCards = _.compact(_.map( this.venueModel.players, 'playedWhiteCard' ));
        } else {
            this.$log.warn( "No hand info to extract!" );
            this.myPlayer = null;
            this.isRegistered = null;
        }
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
        this.extractHand();
        if ( this.venueModel.state !== this.upstreamGameState ) {
            this.$log.debug( '===> Venue Model Game State CHANGE to: ' + this.venueModel.state );
            this.upstreamGameState = this.venueModel.state;
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

                case 'OPEN_SLOTS':
                    this.$log.debug( 'OPEN_SLOTS message received with slots: ' + data.slots );
                    this.numOpenSlotChange( data.slots );
                    break;

                /**
                 * @deprecated
                 */
                case 'START_COUNTDOWN_TICK':
                    this.$log.debug( 'START_COUNTDOWN_TICK message received with time: ' + data.time );
                    this.$rootScope.$broadcast( 'START_COUNTDOWN_TICK', data );
                    break;

                /**
                 * @deprecated
                 */
                case 'START_COUNTDOWN_CANCEL':
                    this.$log.debug( 'START_COUNTDOWN_CANCEL message received' );
                    this.$rootScope.$broadcast( 'START_COUNTDOWN_CANCEL' );
                    break;

                case 'ENOUGH_PLAYERS_TO_START':
                    this.$log.debug( 'ENOUGH_PLAYERS_TO_START message received' );
                    this.$rootScope.$broadcast( 'ENOUGH_PLAYERS_TO_START', { timeout: data.timeout } );
                    break;

                case 'NOT_ENOUGH_PLAYERS_TO_START':
                    this.$log.debug( 'NOT_ENOUGH_PLAYERS_TO_START message received' );
                    // reuse existing message but set neg timeout as flag
                    this.$rootScope.$broadcast( 'ENOUGH_PLAYERS_TO_START', { timeout: -1 } );
                    break;

                case 'REGISTRATION_SUCCESS':
                    this.$log.debug( 'REGISTRATION_SUCCESS message received' );
                    const inboundUUID = data.player && data.player.uuid;
                    if ( inboundUUID === this.uuid ) {
                        this.$rootScope.$broadcast( 'REGISTRATION_SUCCESS', data );
                        this.myPlayer = data.player;
                        this.persistPlayer();
                        this.isRegistered = true;
                    } else {
                        this.$log.debug( '>>> Message not for me' );
                    }

                    break;

                case 'REGISTRATION_FAILURE':
                    this.$log.debug( 'REGISTRATION_FAILURE message received' );
                    const fUUID = data.uuid;
                    if ( fUUID === this.uuid ) {
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

    persistPlayer(){
        // we only need to save the name
        window.sessionStorage.setItem('playerName', this.myPlayer.name );
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
                this.extractHand();
                if ( this.isRegistered ) {
                    this.$log.debug( 'Got registration state message from upstream, but already regged...' );
                    this.$state.go( RegState );
                } else {
                    this.$state.go( LobbyState, { state: 'registration' } );
                }
                break;

            case 'pick':
                this.$log.debug( 'TV side has dealt a hand for round ' + this.venueModel.round + '!' );
                if ( !this.isRegistered && this.isWatching ) {
                    this.$log.debug( 'Switching to watching state' );
                    this.$state.go( WatchingState );
                } else if ( this.isRegistered && this.ogAPI.venueModel.judge.name === this.myPlayer.name ) {
                    this.$log.debug( 'Switching to Judging view, this player is judge!' );
                    this.$state.go( JudgingState );
                } else if ( this.isRegistered ) {
                    this.$log.debug( 'Switching to picking view, this player is picking!' );
                    this.$state.go( PickingState );
                } else {
                    this.$log.debug( "This handset is not watching or playing, kicking to lobby" );
                    this.$state.go( LobbyState );
                }
                break;

            case 'judging':
                this.$log.debug('State change to judging');
                if ( !this.isRegistered && this.isWatching ) {
                    this.$log.debug( 'Switching to watching state' );
                    this.$state.go( WatchingState );
                } else if ( this.isRegistered && this.ogAPI.venueModel.judge.name === this.myPlayer.name ) {
                    this.$log.debug( 'Switching to Judging view, this player is judge!' );
                    //this.$state.go( JudgingState );
                } else if ( this.isRegistered ) {
                    this.$log.debug( 'Switching to picking view, this player is picking!' );
                    this.$state.go( WFRState );
                } else {
                    this.$log.debug( "This handset is not watching or playing, kicking to lobby" );
                    this.$state.go( LobbyState );
                }
        }
    }

    numOpenSlotChange( numSlots ) {
        this.$rootScope.$broadcast( 'OPEN_SLOTS', { slots: numSlots } );
    }


    register( name ) {
        this.uuid = name + ':' + this.ogAPI.getSessionUUID(); //uuid is only unique across browsers, for testing it
                                                              // needs to be more unique
        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTER', name: name, uuid: this.uuid } );
    }

    unregister() {
        if ( this.myPlayer && this.isRegistered ) {
            this.ogAPI.sendMessageToAppRoom( {
                action: 'UNREGISTER', player: this.myPlayer
            } );
            this.isRegistered = false;
            this.myPlayer = null;
        } else {
            throw new Error( 'No one registered to unregister, dipshit!' );
        }
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

    // get judgeName(){
    //     return this.judgeName;
    // }

    get watching() {
        return this.isWatching;
    }

    set watching( isWatching ) {
        this.isWatching = isWatching;
    }

    get gameState() {
        return this.upstreamGameState;
    }

    // Not used anymore? Pulled from model?
    getGameState() {
        return this.ogAPI.sendMessageToAppRoom( { action: 'GET_STATE' } );
    }

    getOpenSlots() {
        return this.ogAPI.sendMessageToAppRoom( { action: 'GET_OPEN_SLOTS' } );
    }

    playCard( card ) {
        _.pullAllWith( this.myHand, [ card ], _.isEqual );
        return this.ogAPI.sendMessageToAppRoom( { action: 'PLAY_WHITE_CARD', player: this.myPlayer, card: card } );
    }

    getHand() {
        return { black: this.blackCard, myHand: this.myHand };
    }

    choseWinner( card ) {
        return this.ogAPI.sendMessageToAppRoom( { action: 'WINNER_PICKED', card: card } );
    }

    get blackCardPrompt(){
        return this.$sce.trustAsHtml( this.blackCard.prompt.replace( '_', '<span class="blank">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' ) );
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
        return 'cahControlService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout', '$state', '$sce' ];
    }
}