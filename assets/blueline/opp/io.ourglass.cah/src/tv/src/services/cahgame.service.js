import CAHGame from '../services/cahgame'

const ENABLE_INACTIVITY_TIMERS = false;

const REG_TIME_WINDOW = 60; // 1 minute
const PICK_TIME_LIMIT = 120; // 2 minutes
let _regTimer = REG_TIME_WINDOW;
let _state;

// used to timeout specific states
let _stateTimer;
let _stateTimerDelay;
let _nextState;

const REG_TEST_PLAYERS = true;
const TEST_PLAYERS = [];//[ 'Albert' ];//, 'Bert', 'Chibert', 'Dilbert', 'Eggbert', 'Dingle' ];//'Filbert', 'Gilbert' ];

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
                this.resetGame();
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
            } );



    }

    resetGame() {
        _regTimer = REG_TIME_WINDOW;
        CAHGame.resetGame();
        this.ogAPI.sendMessageToAppRoom( { action: 'GAME_STATE', state: CAHGame.gameState } );

    }

    regTimerTick() {
        _regTimer--;

        this.ogAPI.sendMessageToAppRoom( { action: 'START_COUNTDOWN_TICK', time: _regTimer } );

        if ( _regTimer !== 0 && this.gameState==='registration') {
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
                        this.addPlayer(data.name, data.uuid);
                    } catch (e){
                        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_FAILURE', name: data.name, msg: e.message,
                            slots: CAHGame.slotsRemaining, uuid: data.uuid } );
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
                    const isRegged = CAHGame.checkPlayer( data.name, data.uuid );
                    if (isRegged){
                        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_SUCCESS', name: data.name } );
                    } else {
                        this.ogAPI.sendMessageToAppRoom( { action: 'DEREGISTRATION_SUCCESS', name: data.name } );
                    }
                    break;

                case 'PLAY_WHITE_CARD':
                    // { action: 'PLAY_WHITE_CARD', player: _myPlayer, card: card }
                    CAHGame.playWhiteCard( data );
                    this.persist();
                    break;

                case 'WINNER_PICKED':
                    CAHGame.pickWinner( data.card );
                    this.persist();
                    this.$timeout(()=> CAHGame.newHand(), 10000);
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

    persist(){
        // the angular.toJson below pulls out the $$hashkey shit angular adds for ng-repeat in ui

        this.ogAPI.venueModel = JSON.parse(angular.toJson(
            {
                players: CAHGame.players,
                state:   _state,
                judge:   CAHGame.currentJudge,
                blackCard: CAHGame.currentBlackCard,
                round: CAHGame.currentRoundNumber,
                handNum: CAHGame.currentHandNumber,
                totalRounds: CAHGame.totalNumberOfRounds
            }
        ));
        this.ogAPI.saveVenueModel();
    }

    gameStateChangeCb( newState ) {
        this.$log.debug( 'State change callback. New state: ' + newState );
        this.cancelStateTimer(); // precaution
        _state = newState;
        this.persist();
        this.ogAPI.sendMessageToAppRoom( { action: 'GAME_STATE', state: newState, round: CAHGame.currentRoundNumber } );

        switch ( _state ){

            case 'reset':
                this.$timeout(()=>{
                    CAHGame.openRegistration();
                }, 1500);
                break;

            case 'registration':
                if (REG_TEST_PLAYERS) this.addTestPlayers();
                break;


            case 'starting':
                this.$log.debug('Getting ready to start. Will wait 15 seconds, then make sure we still have enough players');
                if (CAHGame.numPlayers >= 3){
                    this.$log.debug("We have enough players, let's rock!");
                    CAHGame.deal();
                } else {
                    this.$log.debug("Not enough players now!");
                    this.ogAPI.sendMessageToAppRoom( { action: 'ALERT',
                            msg: 'Not enough players, back to registration.' } );
                    CAHGame.resetGame(); // fugly, but similar to what Halo did
                }
                break;

            case 'pick':
                this.$log.debug('Deal complete! Distributing cards and setting an alarm for 2 min.');
                this.startStateTimer(120, 'judging');
                break;

            case 'judging':
                this.cancelStateTimer();
                this.$log.debug( 'OK, time to judge setting an alarm for 2 min.' );
                this.startStateTimer( 120, 'autojudge' );
                break;

        }
    }

    startStateTimer( delay, nextState ){

        if (!ENABLE_INACTIVITY_TIMERS){
            this.$log.debug('Inactivity timers are disabled. So no timer for you!');
            return;
        }

        _nextState = nextState;
        _stateTimerDelay = delay;
        this.stateTimerTick();
    }

    stateTimerTick() {
        _stateTimerDelay--;
        this.$log.debug('TICK on state timer. Remaining: ' + _stateTimerDelay + ' dest: ' + _nextState);
        if (_stateTimerDelay){
            _stateTimer = this.$timeout(this.stateTimerTick.bind(this), 1000);
        } else {
            this.$log.debug('State timer has timed out, moving to new state: '+_nextState);
            CAHGame.changeGameStateTo(_nextState);
        }
    }

    cancelStateTimer(){
        if (_stateTimer){
            this.$timeout.cancel( _stateTimer );
            _stateTimer = null;
        }
    }

    broadcast( type, msg ) {
        this.$rootScope.$broadcast( type, msg );
    }

    addPlayer( name, uuid ) {
        try {
            const p = CAHGame.addPlayer( name, uuid );
            this.ogAPI.sendMessageToAppRoom( { action: 'REGISTRATION_SUCCESS', player: p } );
            this.persist();
            this.$log.debug( 'Successfully added player: ' + p.name + ' with uuid ' + p.uuid );
            // If the number of players is max players, start happens automatically from CAHGame
            if ( CAHGame.numPlayers > 2 ) {
                this.$log.debug('Sufficient players to start');
                if ( ENABLE_INACTIVITY_TIMERS && !_stateTimer ){
                    this.startStateTimer( REG_TIME_WINDOW, 'starting');
                }
                // Send the message every reg, even after timer started for late registrants
                this.ogAPI.sendMessageToAppRoom( { action: 'ENOUGH_PLAYERS_TO_START', timeout: _stateTimerDelay || -1 } );
            }
        } catch ( e ) {
            throw e;  //rethrow
        }
    }

    removePlayer( player ){

        if (CAHGame.removePlayer( player )){
            this.ogAPI.sendMessageToAppRoom( { action: 'DEREGISTRATION_SUCCESS', name: player.name } );
            if ( CAHGame.numPlayers < 3 && _stateTimer ){
                this.cancelStateTimer();
                this.ogAPI.sendMessageToAppRoom( { action: 'NOT_ENOUGH_PLAYERS_TO_START' } );
            }
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

    get gameState() {
        return CAHGame.gameState;
    }

    get spotsLeft(){
        return CAHGame.slotsRemaining;
    }

    get players(){
        return CAHGame.players;
    }

    static get serviceName() {
        return 'cahGameService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout' ];
    }
}