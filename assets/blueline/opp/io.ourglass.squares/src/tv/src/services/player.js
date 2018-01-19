import _ from 'lodash'


export default class Player{

    constructor(playerName, uuid){
        this.name = playerName;
        this.uuid = uuid;
    }

    setHomeDigit(digit){
        this.homeDigit = digit;
    }

    setAwayDigit( digit ) {
        this.awayDigit = digit;
    }


    checkIfWinner(homeScore, awayScore){
        
    }

}