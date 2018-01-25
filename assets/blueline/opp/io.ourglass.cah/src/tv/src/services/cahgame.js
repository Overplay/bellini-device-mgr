
import CAHDeck from './cahdeck';
import Player from './player';
import _ from 'lodash';

//const cardJson = require('../assets/cards.json');
const cardJson = require('../assets/footballcards.json');

// Decks are array of Card objects with a few methods on it like draw()
let _blackDeck, _whiteDeck;
let _currentBlackCard;
let _dealt = false; // race hack


let _players = [];
let _judge;
let _gameState;
let _handNumber = 0;
let _roundNumber = 0;
let _numPlayedWhiteCards = 0;

let _stateChangeCb;

const NUMBER_OF_ROUNDS = 1;
const MAX_PLAYERS = 3;

/**
 *
 *
 *
 * Game States
 * - registration: allow players to sign up
 * - starting: interstitial, warn players we are about to start, show list of players
 * - deal: draws initial black card and hands
 *
 * ROUNDS
 * - picking
 * - judging
 * - showRoundWinner
 * <repeat until number of rounds>
 *
 * - endSlate: show winner
 *
 */



export default class CAHGame{

    static init( stateChangeCb ){
        //CAHGame.resetGame();
        _stateChangeCb = stateChangeCb;
    }

    static resetGame(){
        _blackDeck = new CAHDeck( 'black', cardJson.black );
        _whiteDeck = new CAHDeck( 'white', cardJson.white );
        _players = [];
        _roundNumber = 0;
        _handNumber = 0;
        _numPlayedWhiteCards = 0;
        _dealt = false;
        CAHGame.changeGameStateTo('reset');
    }

    static changeGameStateTo( newState ) {
        _gameState = newState;
        CAHGame.callbackOnStateChange();
    }

    static callbackOnStateChange(){
        if (_stateChangeCb){
            _stateChangeCb(_gameState);
        }
    }


    /**
     * Add a new player by name/
     * @param {String} playerName
     * @param {String} uuid from control app, session uuid
     * @returns {Player}
     */
    static addPlayer(playerName, uuid){

        if (_players.length>MAX_PLAYERS)
            throw new Error("Game is full. Please wait for next game.");

        if (_gameState !== 'registration')
            throw new Error("Registration is closed, sorry!");

        const hasName = _.find(_players, { name: playerName });
        if (hasName)
            throw new Error("That player name is in use, please pick another.");

        const player = new Player( playerName, uuid );
        _players.push(player);

        const startGame = _players.length === MAX_PLAYERS;
        if (startGame){
            CAHGame.start();
        }

        return player;

    }

    /**
     * See if a player is registered
     * @param {String} playerName
     * @param {String} [uuid] session UUID for player
     * @returns {boolean} true if player is in game
     */
    static checkPlayer( playerName, uuid){
        return _.find( _players, { name: playerName, uuid: uuid } )
    }

    static get players(){
        return _players;
    }

    static playerObjectForName(name){
        return _.find(_players, { name: name });
    }

    static removePlayer(player){
       const wacked =  _.remove(_players, player );
       console.log("Removed "+wacked.length+" players");
       return wacked;
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
        CAHGame.changeGameStateTo('starting');
    }

    static newHand(){

        _handNumber++;
        if (_handNumber === _players.length) {
            console.log('CAHGame has hit end of round.');
            _handNumber = 0;
            _roundNumber++;
            if ( _roundNumber >= NUMBER_OF_ROUNDS ){
                console.log("CAHGame has hit max rounds");
                CAHGame.changeGameStateTo( 'gameover' );
                return; // bail
            }
        }

        _currentBlackCard = _blackDeck.draw();
        _players.forEach( ( p ) => {
            p.resetForNextRound();
            if ( p.hand.length < 7 )
                p.hand.push( _whiteDeck.draw() );
        } );

        CAHGame.newJudge();
        CAHGame.changeGameStateTo( 'pick' );

    }

    // static newRound(){
    //     _roundNumber++;
    //     if (_roundNumber>NUMBER_OF_ROUNDS){
    //     } else {
    //
    //     }
    //
    // }

    static newJudge(){
        _judge = _players[ _handNumber  ];
        _currentBlackCard = _blackDeck.draw();
    }

    static deal() {

        if (_dealt) {
            console.error('Spurious deal, fix your shit');
            return;
        }

        _dealt = true;
        _roundNumber = 1;

        _players.forEach((p)=>{
            _.times(7, ()=> p.hand.push( _whiteDeck.draw() ));
        });

        CAHGame.newJudge();

        CAHGame.changeGameStateTo('pick');

    }

    static openRegistration(){
        CAHGame.changeGameStateTo('registration');
    }

    static get currentJudge() {
        return _judge;
    }

    static get currentBlackCard() {
        return _currentBlackCard;
    }

    static get currentRoundNumber(){
        return _roundNumber;
    }

    static get currentHandNumber() {
        return _handNumber;
    }

    static get totalNumberOfRounds(){
        return NUMBER_OF_ROUNDS;
    }

    static get numPlayedWhiteCards(){
        let numPlayed = 0;
        _players.forEach((p)=>{
            if (p.playedWhiteCard) numPlayed++;
        });
        return numPlayed;
    }

    static get playedWhiteCards() {
        return _.compact(_.map(_players, 'playedWhiteCard'));
    }

    static playWhiteCard( { player, card } ){
        const p = CAHGame.playerObjectForName(player.name);
        if (!p) throw new Error('No such player for playWhiteCard!');
        p.playWhiteCard(card);
        if (CAHGame.numPlayedWhiteCards === (_players.length - 1) ){
            console.log("All players have submitted white cards, changing to judging");
            CAHGame.changeGameStateTo('judging');
        }
    }

    static pickWinner(card){
        _players.forEach((p)=>p.checkIfWinner(card));
    }

    static autojudge(){
        console.log('Autopicking winner...');
        CAHGame.pickWinner(_.sample(CAHGame.playedWhiteCards));
    }


}