import _ from 'lodash';

let _team1name, _team2name;
let _team2score, _team1score;
let _currentQuarter = 0;
let _msBetweenCalcs = 100;
let _timeLeftInQuarter;
let _final;
let _perQScores;

let _possiblePoints = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8 ];

const ODDS_OF_SCORING = 0.25;

export default class GameSim {

    constructor( { team1name, team2name, msBetweenCalcs } ) {

        _currentQuarter = 0;
        _timeLeftInQuarter = 15;
        _team1name = team1name || 'Mudlegs';
        _team2name = team2name || 'Norsemen';
        _team1score = 0;
        _team2score = 0;
        _msBetweenCalcs = msBetweenCalcs || 1000;
        _final = false;
        _perQScores = {
            q1:    { team1score: 0, team2score: 0 },
            q2:    { team1score: 0, team2score: 0 },
            q3:    { team1score: 0, team2score: 0 },
            q4:    { team1score: 0, team2score: 0 },
            final: { team1score: 0, team2score: 0 }
        };

        this.start = this.start.bind(this);
        this.nextTimeStep = this.nextTimeStep.bind(this);
    }

    start() {

        console.log('Starting simulation!');
        _currentQuarter = 1;
        this.nextTimeStep();

    }

    nextTimeStep() {

        if ( !_final ) {

            _timeLeftInQuarter--;

            if ( Math.random() < ODDS_OF_SCORING ) {
                console.log( 'SIM: Scoring drive(s)' );
                _team1score += _.sample( _possiblePoints );
                _team2score += _.sample( _possiblePoints );
                console.log( 'New score. T1: ' + _team1score );
                console.log( 'New score. T2: ' + _team2score );
            }

            if ( !_timeLeftInQuarter ) {
                console.log('Quarter is over.');
                let qidx = (_currentQuarter<5) ? 'q' + _currentQuarter : 'final';
                _perQScores[qidx] = { team1score: _team1score, team2score: _team2score };
                _currentQuarter++;
                _timeLeftInQuarter = 15;
                if (_currentQuarter>4){
                    console.log("Game should be over, let's check...");
                    if (_team1score !== _team2score){
                        _final = true;
                    }
                }
            }

        }

        if (!_final) {
            setTimeout(this.nextTimeStep.bind(this), _msBetweenCalcs);
        }

    }

    get gameInfo(){

        return {
            team1: { name: _team1name, score: _team1score },
            team2: { name: _team2name, score: _team2score },
            quarter: _currentQuarter,
            final: _final,
            perQscores: _perQScores
        }

    }


}