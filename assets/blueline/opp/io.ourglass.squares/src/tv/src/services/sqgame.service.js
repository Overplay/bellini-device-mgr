import SQGame from '../services/sqgame'
import * as TestSupport from './testsupport'

const ENABLE_INACTIVITY_TIMERS = false;
const NUM_TEST_PLAYERS = 98;

const REG_TIME_WINDOW = 60; // 1 minute
const PICK_TIME_LIMIT = 120; // 2 minutes
let _regTimer = REG_TIME_WINDOW;
let _state;

// used to timeout specific states
let _stateTimer;
let _stateTimerDelay;
let _nextState;

const REG_TEST_PLAYERS = true;

export default class SqGameService {

    constructor( $log, ogAPI, $rootScope, $timeout ) {
        $log.debug( "Constructing SqGameService" );
        this.$log = $log;
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;

        SQGame.init( this.gameStateChangeCb.bind( this ) );

        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );

        this.ogAPI.init( {
            appType:             'tv',
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
                SQGame.restoreFrom(this.venueModel);
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
            } );


    }


    deviceModelUpdate( model ) {
        this.deviceModel = model;
    }

    venueModelUpdate( model ) {
        this.venueModel = model;
    }

    appMsgCallback( data ) {

        if ( data.action ) {

            switch ( data.action ) {

                case 'GET_STATE':
                    // request from handset for state
                    this.$log.debug( 'Responding to GET_STATE message' );
                    this.ogAPI.sendMessageToAppRoom( { action: 'GAME_STATE', state: SQGame.gameState } );
                    break;

                case 'GET_OPEN_SLOTS':
                    // request from handset for state
                    this.$log.debug( 'Responding to GET_OPEN_SLOTS message' );
                    this.ogAPI.sendMessageToAppRoom( { action: 'OPEN_SLOTS', slots: SQGame.slotsRemaining } );
                    break;

                case 'REGISTER':
                    // request from handset for state
                    this.$log.debug( 'Responding to REGISTER message' );
                    try {
                        this.addPlayer( data.name, data.uuid );
                    } catch ( e ) {
                        this.ogAPI.sendMessageToAppRoom( {
                            action: 'REGISTRATION_FAILURE', name: data.name, msg: e.message,
                            slots:  SQGame.slotsRemaining, uuid: data.uuid
                        } );
                    }
                    break;

                case 'UNREGISTER':
                    // request from handset for state
                    this.$log.debug( 'Responding to UNREGISTER message' );
                    this.removePlayer( data.player );
                    break;

                case 'CHECK_REGISTRATION':
                    // request from handset for reg exists
                    this.$log.debug( 'Responding to CHECK_REGISTRATION message' );
                    const isRegged = SQGame.checkPlayer( data.name, data.uuid );
                    if ( isRegged ) {
                        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_SUCCESS', name: data.name } );
                    } else {
                        this.ogAPI.sendMessageToAppRoom( { action: 'DEREGISTRATION_SUCCESS', name: data.name } );
                    }
                    break;

                case 'WINNER_PICKED':
                    // CAHGame.pickWinner( data.card );
                    this.persist();
                    break;

            }

        }
    }

    sysMsgCallback( data ) {
        this.sysMsg = data;
    }

    venueMsgCallback( data ) {
        this.venueMsg = data;
    }

    changeGameState( newState ) {

    }

    persist() {

        this.ogAPI.venueModel = SQGame.persistanceObject;
        this.ogAPI.saveVenueModel();
    }

    gameStateChangeCb( newState ) {
        this.$log.debug( 'State change callback. New state: ' + newState );
        // this.cancelStateTimer(); // precaution
        _state = newState;
        this.persist();
        this.ogAPI.sendMessageToAppRoom( { action: 'GAME_STATE', state: newState } );

        switch ( _state ) {

            case 'reset':
                this.$timeout( () => {
                    SQGame.openRegistration();
                }, 1500 );
                break;

            case 'registration':
                if ( REG_TEST_PLAYERS ) this.addTestPlayers();
                break;


            case 'starting':
                break;

        }
    }

    startStateTimer( delay, nextState ) {

        if ( !ENABLE_INACTIVITY_TIMERS ) {
            this.$log.debug( 'Inactivity timers are disabled. So no timer for you!' );
            return;
        }

        _nextState = nextState;
        _stateTimerDelay = delay;
        this.stateTimerTick();
    }

    stateTimerTick() {
        _stateTimerDelay--;
        this.$log.debug( 'TICK on state timer. Remaining: ' + _stateTimerDelay + ' dest: ' + _nextState );
        if ( _stateTimerDelay ) {
            _stateTimer = this.$timeout( this.stateTimerTick.bind( this ), 1000 );
        } else {
            this.$log.debug( 'State timer has timed out, moving to new state: ' + _nextState );
            SQGame.changeGameStateTo( _nextState );
        }
    }

    cancelStateTimer() {
        if ( _stateTimer ) {
            this.$timeout.cancel( _stateTimer );
            _stateTimer = null;
        }
    }

    broadcast( type, msg ) {
        this.$rootScope.$broadcast( type, msg );
    }

    addPlayer( name, uuid ) {
        try {
            const p = SQGame.addPlayer( name, uuid );
            this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_SUCCESS', player: p } );
            this.persist();
            this.$log.debug( 'Successfully added player: ' + p.name + ' with uuid ' + p.uuid );
        } catch ( e ) {
            throw e;  //rethrow
        }
    }

    removePlayer( player ) {

        if ( SQGame.removePlayer( player ) ) {
            this.ogAPI.sendMessageToAppRoom( { action: 'DEREGISTRATION_SUCCESS', name: player.name } );
        }
    }

    // TESTING

    addTestPlayers() {
        _.times( NUM_TEST_PLAYERS, ()=>{
            this.addPlayer(TestSupport.randomFirstName(), _.random(0,1000));
        });
    }

    get gameState() {
        return SQGame.gameState;
    }

    get numPlayers() {
        return SQGame.numPlayers;
    }

    get players() {
        return SQGame.players;
    }

    static get serviceName() {
        return 'sqGameService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout' ];
    }
}