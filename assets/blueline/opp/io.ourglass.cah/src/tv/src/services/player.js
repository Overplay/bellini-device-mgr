import _ from 'lodash'


export default class Player{

    constructor(playerName, uuid){
        this.name = playerName;
        this.uuid = uuid;
        this.handsWon = [];
        this.hand = [];
    }

    addWhiteCard(card){
        this.hand.push(card);
    }

    playWhiteCard(card){
        this.playedWhiteCard = card;
        _.pullAllBy( this.hand, [ { id: card.id  } ], 'id' );
    }

    get numberOfHandsWon(){
        return this.handsWon.length;
    }


    resetForNextRound(){
        this.playWhiteCard = null;
    }

    checkIfWinner(card){
        if (this.playedWhiteCard){
            if ( this.playWhiteCard.id === card.id ) {
                console.log( this.name + ' is the winner of this round!');
                this.handsWon.push( card );
            }
        }
    }

}