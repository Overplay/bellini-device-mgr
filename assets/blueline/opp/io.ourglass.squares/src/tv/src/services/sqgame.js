import Square from './square';
import Player from './player';
import _ from 'lodash';

const MAX_SQUARES = 100; //obvious

let _stateChangeCb;
let _squares = [];
let _players = [];
let _gameState;

let _awayScore, _homeScore, _currentQuarter;

/**
 *
 *
 * Game States
 * - registration: allow players to sign up
 * - playing: interstitial, warn players we are about to start, show list of players
 * - gameover: draws initial black card and hands
 *
 *
 */



export default class SQGame {

    static init( stateChangeCb ) {
        _stateChangeCb = stateChangeCb;
    }

    static restoreFrom( model ) {

        if ( model.squares ) {
            _squares = model.squares;
            _gameState = model.state;
            _awayScore = model.score.away;
            _homeScore = model.score.home;
            _currentQuarter = model.currentQuarter;
        } else {
            SQGame.resetGame(); // no model
        }


        SQGame.callbackOnStateChange();

    }

    static get persistanceObject() {

        // the angular.toJson below pulls out the $$hashkey shit angular adds for ng-repeat in ui
        return JSON.parse( angular.toJson(
            {
                squares:        _squares,
                state:          _gameState,
                score:          SQGame.score,
                currentQuarter: _currentQuarter
            }
        ) );
    }

    static resetGame() {
        _players = [];
        _squares = [];
        _homeScore = 0;
        _awayScore = 0;
        SQGame.changeGameStateTo( 'reset' );
    }

    static changeGameStateTo( newState ) {
        _gameState = newState;
        SQGame.callbackOnStateChange();
    }

    static callbackOnStateChange() {
        if ( _stateChangeCb ) {
            _stateChangeCb( _gameState );
        }
    }


    /**
     * Add a new player by name/
     * @param {String} playerName
     * @param {String} uuid from control app, session uuid
     * @returns {Player}
     */
    static addPlayer( playerName, uuid ) {

        if ( _players.length > MAX_SQUARES )
            throw new Error( "Game is full." );

        if ( _gameState !== 'registration' )
            throw new Error( "Registration is closed, sorry!" );

        const hasName = _.find( _players, { name: playerName } );
        if ( hasName )
            throw new Error( "That player name is in use, please pick another." );

        const player = new Player( playerName, uuid );
        _players.push( player );

        const startGame = _players.length === MAX_SQUARES;
        if ( startGame ) {
            SQGame.start();
        }

        return player;

    }

    /**
     * See if a player is registered
     * @param {String} playerName
     * @param {String} [uuid] session UUID for player
     * @returns {boolean} true if player is in game
     */
    static checkPlayer( playerName, uuid ) {
        return _.find( _players, { name: playerName, uuid: uuid } )
    }

    static get players() {
        return _players;
    }

    static playerObjectForName( name ) {
        return _.find( _players, { name: name } );
    }

    static removePlayer( player ) {
        const wacked = _.remove( _players, player );
        console.log( "Removed " + wacked.length + " players" );
        return wacked;
    }

    static get numPlayers() {
        return _players.length;
    }

    static get slotsRemaining() {
        return MAX_SQUARES - SQGame.numPlayers;
    }

    static get gameState() {
        return _gameState;
    }

    static get currentQuarter() {
        return _currentQuarter;
    }

    static get score() {
        return { home: _homeScore, away: _awayScore };
    }

    static start() {
        SQGame.changeGameStateTo( 'starting' );
    }


    static openRegistration() {
        SQGame.changeGameStateTo( 'registration' );
    }

    static get squares() {
        return _squares;
    }


}