
import CAHDeck from './cahdeck';
import Player from './player';
import _ from 'lodash';

const cardJson = require('../assets/cards.json');

// Decks are array of Card objects with a few methods on it like draw()
let _blackDeck, _whiteDeck;


let _players;
let _judge;
let _gameState;
let _roundNumber = 0;

let _stateChangeCb;

const NUMBER_OF_ROUNDS = 3;
const MAX_PLAYERS = 6;

/**
 *
 *
 *
 * Game States
 * - registration: allow players to sign up
 * - starting: interstitial, warn players we are about to start, show list of players
 *
 * ROUNDS
 * - revealBlackCard
 * - pickWhiteCards
 * - judging
 * - showRoundWinner
 * <repeat until number of rounds>
 *
 * - endSlate: show winner
 *
 */

const VALID_GAME_STATES = ['registration', 'starting', 'revealBlack',
        'judging', 'showWinner', 'pickWhite', 'endSlate' ];

export default class CAHGame{

    static init( stateChangeCb ){
        CAHGame.resetGame();
        _stateChangeCb = stateChangeCb;
    }

    static resetGame(){
        _blackDeck = new CAHDeck( 'black', cardJson.black );
        _whiteDeck = new CAHDeck( 'white', cardJson.white );
        _players = [];
        _gameState = 'registration';
        _roundNumber = 0;

    }

    static callbackOnStateChange(){
        if (_stateChangeCb){
            _stateChangeCb(_gameState);
        }
    }


    /**
     * Add a new player by name/
     * @param {String} playerName
     * @returns {boolean} true if game full
     */
    static addPlayer(playerName){

        if (_players.length>MAX_PLAYERS)
            throw new Error("Game is full. Please wait for next game.");

        if (_gameState !== 'registration')
            throw new Error("Registration is closed, sorry!");

        const hasName = _.find(_players, { name: playerName });
        if (hasName)
            throw new Error("That player name is in use, please pick another.");

        _players.push(new Player(playerName));

        const startGame = _players.length === MAX_PLAYERS;
        if (startGame){
            CAHGame.start();
        }

        return startGame;

    }

    static get players(){
        return _players;
    }


    static removePlayer(playerName){
       const wacked =  _.remove(_players, { name: playerName });
       console.log("Removed "+wacked.length+" players");
    }

    static get numPlayers(){
        return _players.length;
    }

    static get slotsRemaining(){
        return MAX_PLAYERS - CAHGame.numPlayers;
    }

    static get gameState(){
        return _gameState;
    }

    static start(){
        _gameState = 'starting';
        CAHGame.callbackOnStateChange();
    }


}