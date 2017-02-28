/**
 * Squares.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    gameName: {
      type: 'string',
      required: true,
      unique: true
    },

    team1Name: {
      type: 'string',
      defaultsTo: 'Falcons'
    },

    team2Name: {
      type:       'string',
      defaultsTo: 'Patriots'
    },
    
    currentScore: {
      type: 'json',
      defaultsTo: { team1: 0, team2: 0}
    },
    
    // 0 is before game
    currentQuarter: {
      type: 'integer',
      defaultsTo: 0
    },
    
    q1FinalScore: {
      type:       'json',
      defaultsTo: { team1: 0, team2: 0 }
    },

    q2FinalScore: {
      type:       'json',
      defaultsTo: { team1: 0, team2: 0 }
    },

    q3FinalScore: {
      type:       'json',
      defaultsTo: { team1: 0, team2: 0 }
    },

    q4FinalScore: {
      type:       'json',
      defaultsTo: { team1: 0, team2: 0 }
    },
    
    finalScore: {
      type:       'json',
      defaultsTo: { team1: 0, team2: 0 }
    },
    
    state: {
      type:  'string',
      enum: [ 'picking', 'running', 'done' ],
      defaultsTo: 'picking'
    },
    
    overtime: {
      type: 'boolean',
      defaultsTo: false
    }
    

  }
};

/*
 "rowScoreMap": [],
 "colScoreMap": [],
 "gameState" : "picking",
 "grid": [
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ],
 [
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {},
 {}
 ]
 ],
 "currentScore": { "team1": 0, "team2": 0},
 "currentQuarter": 0,
 "gameClock": "0:00",
 "perQuarterScores": [],
 "finalScore": {
 "team1": 0,
 "team2": 0
 },
 "teamNames": { "team1": "Otters", "team2": "Bunnies"}
 */

