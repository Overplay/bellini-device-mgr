import Square from './square';
import Player from './player';
import _ from 'lodash';

const MAX_SQUARES = 100; //obvious

let _stateChangeCb, _persistCb;
let _squares = [];
let _players = [];
let _gameState;

const FORCE_EVENT = {
    team1name: 'NE Patriots',
    team2name: 'PHL Eagles',
    eventId:   'SUPERBOWL2018'
};

const FORCE_RESTART = true; // only for testing!

let _team1name;
let _team1score = 0;
let _team2name;
let _team2score = 0;
let _currentQuarter = 0;
let _eventId = 'SUPERBOWL2018';
let _final;
let _perQscores;
let _currentLeader;

let _winners = [];

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

    static init( { stateChangeCb, persistCb } ) {
        _stateChangeCb = stateChangeCb;
        _persistCb = persistCb;
    }

    static restoreFrom( model ) {

        if ( model.eventId && !FORCE_RESTART ) {
            _squares = model.squares;
            _gameState = model.state;
            _team1score = model.gameInfo.team1.score;
            _team2score = model.gameInfo.team2.score;
            _team1name = model.gameInfo.team1.name;
            _team2name = model.gameInfo.team2.name;
            _currentQuarter = model.gameInfo.currentQuarter;
            _eventId = model.eventId;
            _players = model.players;
            _final = model.final;

        } else {
            console.log( '>>>> Resetting game...' );
            SQGame.resetGame(); // no model
        }


        SQGame.callbackOnStateChange();

    }

    static get persistanceObject() {

        // the angular.toJson below pulls out the $$hashkey shit angular adds for ng-repeat in ui
        return JSON.parse( angular.toJson(
            {
                squares:       _squares,
                state:         _gameState,
                gameInfo:      SQGame.gameInfo,
                players:       _players,
                winners:       _winners,
                eventId:       _eventId,
                gameState:     _gameState,
                final:         _final,
                currentLeader: _currentLeader
            }
        ) );
    }

    static resetGame() {
        _players = [];
        _squares = [];
        _team1score = 0;
        _team2score = 0;
        if ( FORCE_EVENT ) {
            _eventId = FORCE_EVENT.eventId;
            _team1name = FORCE_EVENT.team1name;
            _team2name = FORCE_EVENT.team2name;
        }
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

    // Called from service polling
    static setGameInfo( { team1, team2, final, quarter, perQscores, hardReset } ) {

        if (hardReset) SQGame.resetGame();

        _team1score = team1.score;
        _team2score = team2.score;
        _team1name = team1.name;
        _team2name = team2.name;
        _perQscores = perQscores;
        _final = final;
        _currentQuarter = quarter;

        // TODO break in overtime?
        for ( let qnum = 1; qnum < _currentQuarter; qnum++ ) {
            const idx = 'q' + qnum;
            const thisQ = _perQscores[ idx ];
            _perQscores[ idx ].winner = SQGame.squareForScore( thisQ.team1score, thisQ.team2score );
        }

        if ( _currentQuarter && !_final ) {
            console.log( 'Game is in progress' );
            if ( !_squares.length ) {
                SQGame.allocateSquares();
            }
            SQGame.changeGameStateTo( 'running' );
        } else if ( _final ) {
            console.log( 'Game is final (over)' );
            SQGame.changeGameStateTo( 'gameover' );
        } else {
            SQGame.changeGameStateTo( 'registration' );
        }

        // Has to be after allocation
        _currentLeader = SQGame.squareForScore( _team1score, _team2score );
        _persistCb(); // save it

    }

    static squareForScore( team1score, team2score ) {
        return _.find( _squares, ( s ) => s.checkIfWinner( team1score, team2score ) );
    }

    static allocateSquares() {

        let pidx = 0;

        for ( let t1digit = 0; t1digit < 10; t1digit++ )
            for ( let t2digit = 0; t2digit < 10; t2digit++ ) {
                _squares.push( new Square( _players[ pidx ], t1digit, t2digit ) );
                pidx = (pidx + 1) % _players.length;
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

    static get currentLeader() {
        return _currentLeader.player;
    }

    static get isFinal() {
        return _final;
    }

    static get gameInfo() {
        return {
            team1:   {
                name:  _team1name,
                score: _team1score
            },
            team2:   {
                name:  _team2name,
                score: _team2score
            },
            quarter: _currentQuarter,
            perQscores: _perQscores
        }
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