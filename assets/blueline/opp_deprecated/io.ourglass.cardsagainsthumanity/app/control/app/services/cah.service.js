app.factory('cah', function ($rootScope, $log, ogAPI, $http, $timeout, $interval, $state) {

	var service = {};

	function modelChangedBroadcast() {
		$rootScope.$broadcast('MODEL_CHANGED');
	}

	function stateSwitch(receivedGameStage) {

		// if (service.stage == receivedGameStage) return; //If it hasn't changed don't do anything
		// service.stage = receivedGameStage;
		$rootScope.$broadcast('STAGE_CHANGE');

	}


	function modelChanged(data) {

		$log.info('Device model changed, yay!');

		service.discard = data.discard;
		service.players = data.players;
		service.player = data.players.length ? service.getPlayerByName(service.playerName) : service.player;
		service.roundPlayingCards = data.roundPlayingCards;
		service.roundJudgingCard = data.roundJudgingCard.text ? data.roundJudgingCard : service.roundJudgingCard;
		service.availableCards = data.availableCards != service.availableCards ? data.availableCards : service.availableCards;
		service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;
		service.timeLeft = data.timeLeft ? data.timeLeft : -1;
		if (service.roundTime != data.roundTime) {

			service.timeLeft = data.roundTime;

		}
		service.roundTime = data.roundTime ? data.roundTime : -1;
		service.stage = data.stage ? data.stage : 'start';

		modelChangedBroadcast();
	}

	service.getPlayerByName = function getPlayerByName(name) {
		return _.find(service.players, function (player) {
			return player.name == name;
		});
	}

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

	function inboundMessage(msg) {

		switch (msg.action) {

			case 'newStage':
				stateSwitch(msg.data);
				break;

			case 'winner':
				service.winner = msg.data;
				service.player = {};
				modelChangedBroadcast();
				break;

			case 'clear':
				$rootScope.$broadcast('RESTART');

		}

	}

	function initialize() {

		$log.debug('initializing app and data');

		ogAPI.init({
				appName: 'io.ourglass.cardsagainsthumanity',
				deviceModelCallback: modelChanged,
				messageCallback: inboundMessage,
				appType: 'mobile',
				deviceUDID: 'apple-sim-1'
			})
			.then(function (data) {

				data = data.device;

				service.discard = data.discard.length ? data.discard : [];
				service.players = data.players.length ? data.players : [];
				service.roundPlayingCards = data.roundPlayingCards.length ? data.roundPlayingCards : [];
				service.roundJudgingCard = data.roundJudgingCard.text ? data.roundJudgingCard : {
					text: '',
					id: 0
				};
				service.availableCards = data.availableCards != service.availableCards ? data.availableCards : _.cloneDeep(service.allCards);
				service.availableCards.white = _.shuffle(service.availableCards.white);
				service.availableCards.black = _.shuffle(service.availableCards.black);
				service.stage = data.stage ? data.stage : 'start';
				service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;
				service.timeLeft = data.timeLeft ? data.timeLeft : -1;
				service.roundTime = data.roundTime ? data.roundTime : -1;

				modelChangedBroadcast();


			})
			.catch(function (err) {
				$log.error('Something failed: ' + err);
			});

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


	service.clearGame = function clearGame() {

		sendMessage(name, {
			action: 'clearGame'
		});

	};

	// service.clearController = function clearController() {
	// 	service.player = {};
	// };

	function doTimer() { //I took out stage switching in this one because it's for display purposes only.
		var stageBefore = service.stage;
		$timeout(function () {
			service.timeLeft--;

			service.timeLeftPercent = Math.round((service.timeLeft / service.roundTime) * 100);
			modelChangedBroadcast();

			doTimer();
		}, 1000);
	}

	service.addPlayer = function addPlayer(name) {

		if (service.stage != 'start') throw new Error('The game you tried to join is in progress'); //Game is running

		if (!name) throw new Error('No name provided'); //No name provided

		if (_.findIndex(service.players, function (player) {
				return player.name === name;
			}) >= 0) throw new Error('That name is taken.');


		sendMessage(name, {
			action: 'addPlayer',
			data: name
		});
		service.playerName = name;
	}
	service.nextStage = function nextStage() {
		sendMessage(service.playerName, {
			action: 'nextStage'
		});
	}

	service.debugInfo = function debugInfo() {
		sendMessage(name, {
			action: 'debugInfo'
		});
	}

	service.submitCard = function submitCard(card, player) {
		delete card.$$hashKey;
		sendMessage(service.playerName, {
			action: 'submitCard',
			data: card
		});
	}

	service.pickWinningRoundCard = function (card) {
		delete card.$$hashKey;
		sendMessage(service.playerName, {
			action: 'judgeWinningCard',
			data: card
		}) //This card is loaded with the submittedBy property so we don't need more data
	}

	function sendMessage(playerName, message) {
		playerName = playerName || 'noName';
		if (!message.read) message.read = false; //If we haven't read it, send read status to false

		// if (!ogAPI.model.messages) ogAPI.model.messages = {};


		ogAPI.sendMessageToAppRoom({
				playerName: playerName,
				message: message
			})
			.then(function (response) {
				$log.debug("Message sent to app room!");
			})
			.catch(function (err) {
				$log.debug("An error occurred when sending a message: ", err)
			})


		// ogAPI.model.messages[playerName] = message;

		// stripBullshit();

		// ogAPI.save()
		// 	.then(function (response) {
		// 		$log.debug('Save was cool');
		// 	})
		// 	.catch(function (err) {
		// 		$log.error(err);
		// 		$log.error('WTF?!?!?');
		// 	});


	}

	service.getWinner = function getWinner() {
		sendMessage(service.playerName, {action: 'getWinner'});
	};

	service.amJudge = function amJudge() {
		return service.player.id == service.judgeIndex % service.players.length;
	};

	doTimer();
	initialize();

	return service;
});