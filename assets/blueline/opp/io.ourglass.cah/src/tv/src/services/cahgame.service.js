import CAHGame from '../services/cahgame'

const REG_TIME_WINDOW = 1 * 60; //minutes
let _regTimer = REG_TIME_WINDOW;

const TEST_PLAYERS = [ 'Albert', 'Bert', 'Chibert', 'Dilbert' ]; //, 'Eggbert', ];//'Filbert', 'Gilbert' ];
const VALID_GAME_STATES = [ 'registration', ]

export default class CahGameService {

    constructor( $log, ogAPI, $rootScope, $timeout ) {
        $log.debug( "Constructing CahGameService" );
        this.$log = $log;
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;

        CAHGame.init( this.gameStateChangeCb.bind( this ) );

        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );
        this.regTimerTick = this.regTimerTick.bind( this );

        this.ogAPI.init( {
            appType:             'tv',
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
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
            } );


        this.resetGame();
        this.addTestPlayers();
    }

    resetGame() {
        _regTimer = REG_TIME_WINDOW;
        CAHGame.resetGame();
    }

    regTimerTick() {
        _regTimer--;

        this.ogAPI.sendMessageToAppRoom( { action: 'START_COUNTDOWN_TICK', time: _regTimer } );

        if ( _regTimer !== 0 ) {
            this.regTimer = this.$timeout( this.regTimerTick, 1000 );
            return;
        }

        this.$log.debug( 'Reg timer down to 0' );
        if ( CAHGame.numPlayers > 2 ) {
            this.$log.debug( 'There are >2 players, starting game!' );
            CAHGame.start();
        } else {
            this.$log.debug( 'Someone must have de-regged during countdown' );
            this.ogAPI.sendMessageToAppRoom( { action: 'START_COUNTDOWN_CANCEL' } );
            _regTimer = REG_TIME_WINDOW;
        }
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
                    this.ogAPI.sendMessageToAppRoom( { action: 'GAME_STATE', state: CAHGame.gameState } );
                    break;

                case 'GET_OPEN_SLOTS':
                    // request from handset for state
                    this.$log.debug( 'Responding to GET_OPEN_SLOTS message' );
                    this.ogAPI.sendMessageToAppRoom( { action: 'OPEN_SLOTS', slots: CAHGame.slotsRemaining } );
                    break;

                case 'REGISTER':
                    // request from handset for state
                    this.$log.debug( 'Responding to REGISTER message' );
                    try {
                        CAHGame.addPlayer(data.name);
                        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_SUCCESS', name: data.name } );
                    } catch (e){
                        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_FAILURE', name: data.name, msg: e.message,
                            slots: CAHGame.slotsRemaining } );
                    }
                    break;

                case 'UNREGISTER':
                    // request from handset for state
                    this.$log.debug( 'Responding to UNREGISTER message' );
                    CAHGame.removePlayer( data.name );
                    this.ogAPI.sendMessageToAppRoom( { action: 'DEREGISTRATION_SUCCESS', name: data.name } );
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

    gameStateChangeCb( newState ) {
        this.$log.debug( 'State change callback. New state: ' + newState );
        this.broadcast( 'GAME_STATE', { state: newState } );
    }

    broadcast( type, msg ) {
        this.$rootScope.$broadcast( type, msg );
        this.ogAPI.sendMessageToAppRoom( { type: type, msg: msg } );
    }

    addPlayer( name ) {
        try {
            CAHGame.addPlayer( name );
            this.$log.debug( 'Successfully added player: ' + name );
            this.broadcast( 'PLAYER_ADDED', { name: name, remainingSlots: CAHGame.slotsRemaining } );
            if ( CAHGame.numPlayers > 2 && !this.regTimer ) {
                _regTimer = REG_TIME_WINDOW; // 300 seconds
                this.regTimer = this.$timeout( this.regTimerTick, 1000 );
            }
        } catch ( e ) {
            throw e;  //rethrow
        }

    }

    // TESTING

    addTestPlayers() {

        for ( let i = 0; i < TEST_PLAYERS.length; i++ ) {
            this.$timeout( () => {
                this.addPlayer( TEST_PLAYERS[ i ] );
            }, 1000 + i * 500 );

        }

    }

    getGameState() {
        return CAHGame.gameState;
    }

    static get serviceName() {
        return 'cahGameService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout' ];
    }
}