# Cards against humanity app, a writeup

* Models will probably have a game id to allow for multiple games to be played. Any calls to model will only update the part that we are keeping track of. This might not be simple with the current architecture. This is something worth discussing.

* For purposes of description, I will be sepparating this into "Starting / No Game" phase, "Picking" phase, "Judging" phase, and "Ending" phase
* The model will be split into model.starting, model.picking, and model.judging each hodling different kinds of data.
* Judging timer should adjust based on number of cards submitted. 
* When I mention a countdown timer, I am thinking of a shrinking progress bar at the bottom of any screen [Like this animated bootstrap example](http://i.imgur.com/LhsnCJZ.gif)
* Each phase _could_ contain multiple timers. For example, judging will have a "choosing" timer and "winner display" timer. That said, it doesn't necessarily have to be a different property in the model

* Model descriptions are suggested. Changes may be required when writing.
* There should be a model property for each phase (except ending, probably) and one for players
* Players model keeps track of white cards, score, and black cards earned

* Should be resiliant to temporary lapses in internet connectivity. This could arguably be accomplished by allowing a round or two of no response mentioned above.
* Should be visually pleasing, according to company style

#### Suggested Directives

* White Card
* Black Card
* Countdown Timer


## Requirements

* Play a CAH-Like game with player cards, a single judge, score kept and displayed to each user
* Be resistant to users disconnecting or not answering, we might want to timeout players who don't answer fast enough
* Limit number of players that can join, for nice display purposes. We want TV text to be legible.
* Each phase will have its own partial (or partials in some cases) that do different things.
* Each user will always have the option to leave the game, which will drop them out of the active round. If they are judging, skip the round (and return white cards).
* If a user doesn't take an action for 3 rounds, they should be removed from the game
* This will be the _first full-screen tv app and will cover the entire tv stream_ (Note: Investigate way of muting the TV when this app is activated)
* The above bullet point means that no other apps will be running while this app is running. 

## Future Goals for Futher Iterations - not to be implemented in v1.0.0 (To be implemented later, possibly)

* Let venue controllers add their own cards (ex: "If you see this card you get 25% off your next item" or "Donald Trump's Toupee")
* The above bullet will need to be saved long-term in the database instead of a model.

---

## Starting Phase

* This phase will only run _once_ per game. 

### Implementation - TV

* Show code to let users join a game
* Show number of players in the game

### Implementation - Controller

* Allow users or venue admin to create a new CAH game (those who create will be the master client)
* Allow anyone to join a game based on TV Code (anyone who joins will be considered a slave client)

#### Master

The master client is the one to have started the lobby. 

* Show number (and names?) of entered players
* Show a button to start the game
* Show a button to disband the lobby
* Optional: Allow kicking users. (This feature could be up for debate. Could start fights ¯\\\_(ツ)_/¯ )
* Allow for changing max score but use default of 5 

#### Slave

* Say "you have entered the game"
* Allow them to leave lobby

### Model (.starting property)

* Contains game ID to join

---

## Picking Phase

* The timer for this phase should adjust depending on # of cards needed to be submitted. 30 seconds minimum with an extra 15 per extra card is probably fine. That means 60 seconds for 3 cards, etc.

### Implementation - TV

* Show leading player and score
* Show current round's black card
* Show round timer for submitting cards
* Show number (or names) of players who have submitted their cards

### Implementation - Controller

#### Judge

* show a message along the lines of "You are the judge, sit back while other choose." and the round length timer

#### Picker

* Show round timer for submitting cards
* Show cards in hand and allow picking
* When picked, card(s) leave(s) hand and is sent to "judging" phase
* Afer card leaves hand, draw a new card from the "deck" property
* For blank cards, allow UIB String popup for enter custom text (up to a certain length) - length to be determined by what fits on screen


### Model (.picking property)

* Will contain round countdown timer start and length (for countdown remaining calculation)
* Will contain # of cards needed to be submitted

---

## Judging

* Cards will have a submittedBy property that allows for point assignment or card return on skipped round.
* Only show white cards if all users are submitted and judge is there.
* If cards have been shown, skipping a round will _**not**_ return the cards.
* In this round, master/slave doesn't matter. What matters is judge/picker

### Implementation - TV

* Show all cards that have been submitted. 
* Show how long before judge has to pick the winning card (or card pair).
* Show black card that is being judged
* Show judge's name (optional but would be neat if it fits nicely)
* Once picked, show black card and winning white card for 8 seconds (along with the timer?)

### Implementation - Controller

#### Judge

* Show all the card choices you can pick from, may require scrolling
* Allow for picking a winning card or card set. Require a confirmation. Click once for choice, a second time to confirm

#### Picker

* Show your white card
* Show black card
* Show round timer

### Model (.judging property)

* Will have round time left
* Will have white cards to judge
* White cards will have a submittedBy property 
* Will have black card to judge for
* When moving on from this model, it will be reset to default and filled back out on next iteration of game loop

---

## Ending

### Implementation - TV

* Show winning player name and score
* If game was cancled early by the master client, show player (or players) with the highest score

### Implementation - Controller

#### Master

* Allow for restart of game with same players

#### Slave

* Allow for leaving the game


---

# Other Notes

* Advertisiments could probably be run in the corners of the screen or when there is an abundance of free space.
* We could also include advertized taglines. For example: The budwiser winner of this round is _name_ and that person gets a cheap budwiser or something along the lines of promotion


---

# Demo Notes

* Make it more obvious what you have to do for each phase
* Make it more obvious which card is the winning
* Bold font on the cards
* Reduce the height of the Title
* Make the buttons look full width like other apps
* Add timers for each round.