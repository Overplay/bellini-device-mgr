

export default class Square {

    constructor( player, team1digit, team2digit ) {
        this.player = player;
        this.team1digit = team1digit;
        this.team2digit = team2digit;
    }

    checkIfWinner( team1score, team2score ) {

        const team1last = team1score % 10;
        const team2last = team2score % 10;
        return (this.team1digit === team1last ) && ( this.team2digit === team2last);

    }

}