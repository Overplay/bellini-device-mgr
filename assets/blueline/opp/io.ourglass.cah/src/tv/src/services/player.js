

export default class Player{

    constructor(playerName){
        this.name = playerName;
        this.handsWon = [];
        this.hand = [];
    }

    addWhiteCard(card){
        this.hand.push(card);
    }


    get numberOfHandsWon(){
        return this.handsWon.length;
    }

    wonWithCard(card){
        this.handsWon.push(card);
    }

}