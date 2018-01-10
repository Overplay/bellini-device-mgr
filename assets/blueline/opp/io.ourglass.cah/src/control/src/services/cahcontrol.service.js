
let _playerName;
let _isRegistered = false;

export default class CahControlService {

    constructor( $log, ogAPI, $rootScope, $timeout ) {
        $log.debug( "Constructing CahControlService" );
        this.$log = $log;
        this.ogAPI = ogAPI;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;


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
        this.$log.debug( "AppMessage: " + data );

        if ( data.action ) {
            switch ( data.action ) {
                case 'GAME_STATE':
                    this.$log.debug( 'GAME_STATE message received with state: ' + data.state );
                    this.gameStateChange(data.state);
                    break;

                case 'OPEN_SLOTS':
                    this.$log.debug( 'OPEN_SLOTS message received with slots: ' + data.slots );
                    this.numOpenSlotChange( data.slots );
                    break;

                case 'START_COUNTDOWN_TICK':
                    this.$log.debug( 'START_COUNTDOWN_TICK message received with time: ' + data.time );
                    this.$rootScope.$broadcast('START_COUNTDOWN_TICK', data );
                    break;

                case 'START_COUNTDOWN_CANCEL':
                    this.$log.debug( 'START_COUNTDOWN_CANCEL message received');
                    this.$rootScope.$broadcast( 'START_COUNTDOWN_CANCEL' );
                    break;

                case 'REGISTRATION_SUCCESS':
                    this.$log.debug( 'REGISTRATION_SUCCESS message received' );
                    this.$rootScope.$broadcast( 'REGISTRATION_SUCCESS', data );
                    _playerName = data.name;
                    _isRegistered = true;
                    break;

                case 'REGISTRATION_FAILURE':
                    this.$log.debug( 'REGISTRATION_SUCCESS message received' );
                    this.$rootScope.$broadcast( 'REGISTRATION_FAILURE', data );
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


    gameStateChange( newState ) {
        this.$log.debug( 'State change callback. New state: ' + newState );
        this.$rootScope.$broadcast( 'GAME_STATE', { state: newState } );
    }

    numOpenSlotChange( numSlots ){
        this.$rootScope.$broadcast( 'OPEN_SLOTS', { slots: numSlots } );
    }


    register( name ) {
        this.ogAPI.sendMessageToAppRoom( { action: 'REGISTER', name: name } );
    }

    unregister()  {
        if (_playerName && _isRegistered){
            this.ogAPI.sendMessageToAppRoom( { action: 'UNREGISTER', name: name } );
            _isRegistered = false;
            _playerName = '';
        } else {
            throw new Error('No one registered to unregister, dipshit!');
        }
    }

    get registered(){
        return _isRegistered;
    }

    get playerName() {
        return _playerName;
    }

    getGameState() {
        return this.ogAPI.sendMessageToAppRoom( { action: 'GET_STATE' } );
      }

    getOpenSlots() {
        return this.ogAPI.sendMessageToAppRoom( { action: 'GET_OPEN_SLOTS' } );
    }

    static get serviceName() {
        return 'cahControlService';
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAPI', '$rootScope', '$timeout' ];
    }
}