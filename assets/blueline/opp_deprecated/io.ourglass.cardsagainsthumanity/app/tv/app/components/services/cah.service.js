app.factory('cah', ['$rootScope', '$log', 'ogAPI', '$http', '$timeout', '$interval',
	function ($rootScope, $log, ogAPI, $http, $timeout, $interval) {


		var service = {};
		service.NUM_CARDS = 6; //const
		service.NUM_TO_WIN = 3; //const

		service.allCards = {
			white: [{
				text: 'Cards have not loaded yet.',
				id: 0
			}],
			black: [{
				text: 'Cards have not loaded yet.',
				id: 0,
				pick: 0
			}]
		};
		service.clearGame = function clearGame() {

			service.discard = [];
			service.players = [];
			service.roundPlayingCards = [];
			service.roundJudgingCard = {
				text: '',
				id: 0
			};
			service.judgeIndex = 0;
			service.stage = 'start';
			service.roundTime = -1;
			service.timeLeft = -1;
			service.previousWinningCard = {
				text: '',
				id: 0
			}
			service.previousJudgingCard = {
				text: '',
				id: 0,
				pick: 1
			}

			$http.get('app/assets/cards.json')
				.then(function (response) {
					$log.debug('Cards Loaded!');
					service.allCards = response.data;
					service.availableCards = _.cloneDeep(service.allCards);
					service.availableCards.white = _.shuffle(service.availableCards.white);
					service.availableCards.black = _.shuffle(service.availableCards.black);
				}).catch(function (err) {
					$log.debug('Cards Load Failed!');
					$log.error(err);
				});

			gameInProgress = false;

			saveModel();
			ogAPI.sendMessageToAppRoom({
				action: 'clear'
			});

		};

		service.clearGame();



		var gameInProgress = false;


		/**
		 * Swap service to next stage.
		 * roundTime always refers to the next stage length. For example, time set in start will apply in picking
		 */
		service.nextStage = function nextStage(timedOut) {

			switch (service.stage) {

				case 'start': //We will only go from start to picking once a game
					if (gameInProgress) return false; //If two people hit start at the same time it won't destroy us
					service.assignCards(); //Give everyone white cards
					service.roundJudgingCard = service.getBlackCard();
					service.stage = 'picking';
					service.roundTime = (10 * service.players[0].cards.white.length) + 20;
					gameInProgress = true;
					break;

				case 'picking': //Part of the main game loop, will happen often
					if (!timedOut) {
						service.roundTime = (15 * service.roundPlayingCards.length);
						service.stage = 'judging';
					} else {
						service.roundTime = 10 * service.players[0].cards.white.length;
						service.judgeIndex++;
						service.roundJudgingCard = service.getBlackCard();
						service.giveMissingWhiteCards();
						service.discardCards();
					}
					break;

				case 'judging': //Part of the main game loop

					if (service.getWinner()) {
						service.stage = 'end';
						service.roundTime = 3 * 60; // 3 minutes until the game auto-clears
						break;
					}


					service.stage = 'picking';
					service.roundJudgingCard = service.getBlackCard();
					service.giveMissingWhiteCards();
					service.discardCards();
					service.roundTime = (10 * service.players[0].cards.white.length) + 20; //10 seconds per card, 20 seconds to show previous round win
					if (timedOut) {
						var judgeName = service.getPlayerById(service.players.length % service.judgeIndex).name;
						service.previousJudgingCard = {
							text: 'Better go wake up ' + judgeName + '!',
							id: 0,
							pick: 1
						};
						service.previousWinningCard = {
							text: judgeName + ': *ding-a-ling* SHAME     SHAME *ding-a-link*'
						};
					}
					service.judgeIndex++;
					break;

				case 'end':
				default:
					if (!gameInProgress) return false; //If someone hits play again the same time as someone else it will only fire once.
					service.clearGame();
					gameInProgress = false;
					service.stage = 'start';
					service.roundTime = -1;

			}

			service.timeLeft = service.roundTime;

			saveModel(service.stage);
			return true;


		};

		/**
		 * Goes through the players to check for a winner.
		 * 
		 * @returns {player | undefined} player
		 */
		service.getWinner = function getWinner(shouldBroadcast) {
			var winner = _.find(service.players, function (player) {
				return player.cards.black.length >= service.NUM_TO_WIN;
			});

			if (shouldBroadcast) {
				ogAPI.sendMessageToAppRoom({
					action: 'winner',
					data: winner
				});
			}

			return winner;
		};

		/**
		 * Returns player with mathcmatching ID, undefined otherwise
		 * 
		 * @param {number} id
		 * @returns {player | undefined}
		 */
		service.getPlayerById = function getPlayerById(id) {
			return _.find(service.players, function (player) {
				return player.id == id;
			});
		};

		/**
		 * Returns player with matching name, undefined otherwise
		 * 
		 * @param {any} name 
		 * @returns {player | undefined}
		 */
		service.getPlayerByName = function getPlayerByName(name) {
			return _.find(service.players, function (player) {
				return player.name == name;
			});
		}

		/**
		 * Sets service variables on model change. 
		 * 
		 * @param {any} data 
		 */
		function modelChanged(data) {

			$log.info('Device model changed, yay!');

			service.discard = data.discard;
			service.players = data.players;
			service.roundPlayingCards = data.roundPlayingCards;
			service.roundJudgingCard = data.roundJudgingCard.text ? data.roundJudgingCard : service.roundJudgingCard;
			service.availableCards = data.availableCards != service.availableCards ? data.availableCards : service.availableCards;
			service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;
			service.timeLeft = data.timeLeft ? data.timeLeft : -1;
			if (service.roundTime != data.roundTime) {

				service.timeLeft = data.roundTime;

			}
			service.roundTime = data.roundTime ? data.roundTime : service.timeLeft;

			for (var key in data.messages) {
				processMessage(key, data.messages[key]); //Passes username and message contents
			}

			service.stage = data.stage ? data.stage : 'start';

			service.previousWinningCard = data.previousWinningCard ? data.previousWinningCard : {
				text: '',
				id: 0
			}
			service.previousJudgingCard = data.previousJudgingCard ? data.previousJudgingCard : {
				text: '',
				id: 0,
				pick: 1
			}
			service.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated).getTime() : new Date().getTime();

			modelChangedBroadcast();
		}

		function stripBullshit() {

			try {
				for (var i = 0; i < service.roundPlayingCards.length; i++) {
					delete service.roundPlayingCards[i].$$hashKey; //Angular adds this somewhere but idk where
				}
			} catch (e) { //If it's undefined I don't want to throw an error

			}


			try {
				for (var z = 0; z < service.players.length; z++) {
					for (var x = 0; x < service.players[z].cards.white.length; x++) {
						delete service.players[z].cards.white[x].$$hashKey; //Angular adds this somewhere but idk where
					}
				}
			} catch (e) {
				//If it's undefined I want it to still work
			}

			try {
				for (var j = 0; j < service.players.length; j++) {
					for (var n = 0; n < service.players[j].cards.black.length; n++) {
						delete service.players[j].cards.black[n].$$hashKey; //Angular adds this somewhere but idk where
					}
				}
			} catch (e) {
				//If it's undefined I want it to still work
			}
		}

		function saveModel(stage) {

			stripBullshit();

			ogAPI.model = {
				discard: service.discard, //Needed to prevent reshuffle inconsistencies
				players: service.players, //Needed to sync scores and taken out cards
				roundPlayingCards: service.roundPlayingCards, //Needed for the judge to judge
				roundJudgingCard: service.roundJudgingCard, //Needed for black card to spread around
				availableCards: service.availableCards, //Needed so somebody doesn't pull a card someone else has
				stage: service.stage,
				judgeIndex: service.judgeIndex,
				roundTime: service.roundTime,
				timeLeft: service.timeLeft,
				NUM_TO_WIN: service.NUM_TO_WIN,
				previousWinningCard: service.previousWinningCard,
				previousJudgingCard: service.previousJudgingCard,
				lastUpdated: new Date().getTime()
			};

			ogAPI.save()
				.then(function (response) {
					$log.debug('Save was cool');
					modelChangedBroadcast();
					if (stage) {
						ogAPI.sendMessageToAppRoom({
							action: 'newStage',
							data: stage
						});
					}
				})
				.catch(function (err) {
					$log.error('ogApi.Save() Error:', err);
					$log.error('WTF?!?!?');
				});

		}

		function inboundMessage(msg) {

			$log.debug(msg);

			if (!msg.playerName) {
				return;
			}

			processMessage(msg.playerName, msg.message);

		}

		function doTimer() {
			var stageBefore = service.stage;
			$timeout(function () {
				service.timeLeft--;

				service.timeLeftPercent = Math.round((service.timeLeft / service.roundTime) * 100);
				modelChangedBroadcast();

				if (service.timeLeft == 0) {
					service.nextStage(true);
				}


				doTimer();
			}, 1000);
		}


		/**
		 * Broadcasts model changed and service variables
		 * 
		 */
		function modelChangedBroadcast() {
			$rootScope.$broadcast('MODEL_CHANGED');
		}



		/**
		 * Initialization step, connects to ogAPI
		 * 
		 */
		function initialize() {

			$log.debug('initializing app and data');

			ogAPI.init({
					appName: 'io.ourglass.cardsagainsthumanity',
					deviceModelCallback: modelChanged,
					messageCallback: inboundMessage,
					appType: 'tv',
					deviceUDID: 'apple-sim-1'
				})
				.then(function (data) {

					data = data.device;

					// service.discard = data.discard.length ? data.discard : [];
					// service.players = data.players.length ? data.players : [];
					// service.roundPlayingCards = data.roundPlayingCards.length ? data.roundPlayingCards : [];
					// service.roundJudgingCard = data.roundJudgingCard.text ? data.roundJudgingCard : {
					// 	text: '',
					// 	id: 0
					// };
					// service.availableCards = data.availableCards != service.availableCards ? data.availableCards : _.cloneDeep(service.allCards);
					// service.availableCards.white = _.shuffle(service.availableCards.white);
					// service.availableCards.black = _.shuffle(service.availableCards.black);
					// service.stage = data.stage ? data.stage : 'start';
					// service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;
					// service.timeLeft = data.timeLeft ? data.timeLeft : -1;
					// service.roundTime = data.roundTime ? data.roundTime : -1;
					// service.previousWinningCard = data.previousWinningCard ? data.previousWinningCard : { text: "", id: 0 }
					// service.previousJudgingCard = data.previousJudgingCard ? data.previousJudgingCard : { text: "", id: 0, pick: 0 }

					// modelChangedBroadcast();

					service.lastUpdated = data.lastUpdated;

					service.clearGame();

					$interval(function () {
						if ((new Date().getTime() - service.lastUpdated) / 1000 > 3 * 60) {
							service.clearGame();
							service.lastUpdated = new Date();
						}
					}, 30 * 1000);


				})
				.catch(function (err) {
					$log.error('Something failed: ' + err);
				});

		}

		/**
		 * Adds a card to roundPlayingCards and who sent it
		 * 
		 * @param {any} card 
		 * @param {any} player 
		 */
		service.submitCard = function submitCard(card, player) {

			if (_.findIndex(service.roundPlayingCards, function (cardListItem) {
					return cardListItem.id == card.id;
				}) >= 0) {
				return; //If it exists don't add it again
			}

			for (var i = 0; i < player.cards.white.length; i++) {
				delete player.cards.white[i].$$hashKey; //Angular adds this somewhere but idk where 
			}

			service.roundPlayingCards.push({
				id: card.id,
				text: card.text,
				submittedBy: {
					name: player.name,
					id: player.id
				}
			});

			var servicePlayer = service.getPlayerById(player.id);
			_.remove(servicePlayer.cards.white, function (cardListItem) {
				return card.id == cardListItem.id;
			});

			if (service.roundPlayingCards.length == service.players.length - 1) {
				service.nextStage();
			}

			saveModel();

		};

		service.getPlayerScoreForId = function getPlayerScoreForId(id) {

			if (service.players.length == 0) {
				throw new Error('no players!');
			}


			for (var i = 0; i < service.players.length; i++) {
				if (id == service.players[i].id) {
					return service.players[i].cards.black.length;
				}
			}

			throw new Error('noUserId:  ' + id); //Do this if service.players.length == 0 or id not found

		};

		service.discardCards = function discardCards() {
			for (var i = 0; i < service.roundPlayingCards.length; i++) {
				var card = service.roundPlayingCards[i];
				service.discard.push({
					id: card.id,
					text: card.text
				});
			}
			service.roundPlayingCards = [];

			saveModel();

		};

		service.assignCards = function assignCards() {

			if (service.players.length <= 0) {
				throw new Error('No players to assign cards to');
			}

			for (var i = 0; i < service.players.length * service.NUM_CARDS; i++) {
				service.players[i % service.players.length].cards.white.push(service.getWhiteCard());
			}

			saveModel();

		};

		service.giveMissingWhiteCards = function giveMissingWhiteCards() {

			if (service.players.length <= 0) {
				throw new Error('No players to assign cards to');
			}

			for (var i = 0; i < service.players.length; i++) {

				if (service.players[i].cards.white.length < service.NUM_CARDS) {
					service.players[i].cards.white.push(service.getWhiteCard());
				}
			}

			saveModel();
		};

		service.getWhiteCard = function getWhiteCard() {
			if (service.availableCards.white.length <= 0) {
				service.reshuffle();
			}
			return service.availableCards.white.shift();
		};

		service.getBlackCard = function getBlackCard() {
			if (service.availableCards.black.length <= 0) {
				throw new Error('No black cards to pick!');
			}
			return service.availableCards.black.shift();
		};

		service.reshuffle = function reshuffle() {
			if (service.discard.length <= 0) {
				throw new Error('No cards to reshuffle!');
			}

			for (var i = 0; i < service.discard.length; i++) {

				service.availableCards.white.push(service.discard[i]);

			}

			service.discard = [];

			service.availableCards.white = _.shuffle(service.availableCards.white);

			//As of right now, I don't think we need to tell the client we put cards from default to available.

		};

		service.addPlayer = function addPlayer(name) {

			if (service.stage != 'start') throw new Error('The game you tried to join is in progress'); //Game is running

			if (!name) throw new Error('No name provided'); //No name provided

			if (_.findIndex(service.players, function (player) {
					return player.name === name;
				}) >= 0) throw new Error('That name is taken.'); //Someone with that name exists

			var player = {
				id: service.players.length,
				cards: {
					white: [],
					black: []
				},
				name: name
			};

			service.players.push(player);

			saveModel();
			return player;
		};

		service.addBlackCardToPlayerById = function addBlackCardToPlayerById(id, blackCard, whiteCard) {

			if (!blackCard.pick) {
				$log.error('Cannot add white blackCards to black blackCard field.');
				return;
			}

			service.previousJudgingCard = _.cloneDeep(blackCard);
			service.previousWinningCard = whiteCard;

			var player = service.getPlayerById(id);

			if (!player) {
				throw new Error('No player with id: ' + id);
			}

			var blackCardText;

			if (whiteCard) {
				if (blackCard.text.indexOf('_') != -1) {
					blackCardText = blackCard.text.replace('_', whiteCard.text);
				} else {
					blackCardText = blackCard.text + " " + whiteCard.text;
				}
			}


			blackCard.text = blackCardText;
			player.cards.black.push(blackCard);


			saveModel();

		};

		function processMessage(player, message) {

			if (message.read) {
				return; //If we already looked at the message, throw it out
			}

			message.read = true; //We've read it now.

			player = service.getPlayerByName(player) ? service.getPlayerByName(player) : player; //Either gets player object or leaves it as name

			switch (message.action) {

				case 'addPlayer':
					service.addPlayer(player); //This will be just the name here
					break;

				case 'submitCard':
					service.submitCard(message.data, player)
					break;

				case 'nextStage':
					if (!service.nextStage()) return; //If it has double-start or double-restart messages don't save the model.
					break;

				case 'clearGame':
					service.clearGame();
					break;

				case 'judgeWinningCard':
					service.judgeWinningCard(message.data);
					break;

				case 'debugInfo':
					service.debugInfo();
					break;

				case 'getWinner':
					service.getWinner(true);
					break;


				default:
					$log.debug(message.action);
			}

			saveModel();

		}

		service.judgeWinningCard = function (card) {
			var player = card.submittedBy;
			service.addBlackCardToPlayerById(player.id, service.roundJudgingCard, card);
		};

		service.debugInfo = function debugInfo() {
			$log.debug(service);
		};


		initialize();
		doTimer();


		return service;

	}
]);