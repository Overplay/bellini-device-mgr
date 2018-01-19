

export default class Square {

    constructor( player, awayDigit, homeDigit ) {
        this.player = player;
        this.awayDigit = awayDigit;
        this.homeDigit = homeDigit;
    }

    checkIfWinner( homeScore, awayScore ) {

        const homeLast = homeScore % 10;
        const awayLast = awayScore % 10;
        return (this.awayDigit === awayLast ) && ( this.homeDigit === homeLast);

    }

}