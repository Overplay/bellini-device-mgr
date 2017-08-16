app.factory('cah', function ($rootScope, $log, ogAPI, $http, $timeout) {
	var service = {};

	var NUM_CARDS = 6;

	service.allCards = {
		white: [
			{ text: 'Cards have not loaded yet.', id: 0 }
		],
		black: [
			{ text: 'Cards have not loaded yet.', id: 0, pick: 0 }
		]
	};

	$http.get('app/assets/cards.json')
		.then(function (response) {
			$log.debug('Cards Loaded!');
			service.allCards = response.data;
			console.log(service.allCards);
			service.availableCards = _.cloneDeep(service.allCards);
			service.availableCards.white = _.shuffle(service.availableCards.white);
			service.availableCards.black = _.shuffle(service.availableCards.black);
		}).catch(function (err) {
			$log.debug('Cards Load Failed!');
			$log.error(err);
		});

	service.nextStage = function nextStage() {
		$log.debug('Service Switch:', service.stage);
		switch (service.stage) {
			case 'start':
				service.assignCards();
				service.roundJudgingCard = service.getBlackCard();
				service.stage = 'picking';
				break;
			case 'picking':
				service.stage = 'judging';
				break;
			case 'judging':
				if (service.getWinner()) {
					service.stage = 'end';
					break;
				}
				service.judgeIndex++;
				service.discardCards();
				service.roundJudgingCard = service.getBlackCard();
				service.giveMissingWhiteCards();
				service.stage = 'picking';
				break;
			case 'end':
			default:
				service.player = {};	
				service.stage = 'start';
		}

		saveModel();
		modelChangedBroadcast();
	};

	/**
	 * Returns winner object if exists, undefined if not
	 * 
	 */
	service.getWinner = function getWinner() {
		return _.find(service.players, function (player) {
			return player.cards.black.length >= 3;
		});
	};

	service.stage = 'start';
	service.roundPlayingCards = []; //One of these will look like {id: 0, text: "123", submittedBy: {name: 'Logan', id: 0}}
	service.roundJudgingCard = { text: '', id: 0 };
	service.discard = []; //This will just be {id: 0, text: 'someText'}
	service.players = []; //A player will look like        { id: 0, cards: {white: [], black: []}, name: "Logan" }
	service.player = {};
	service.getPlayerScoreForId = function getPlayerScoreForId(id) {

		if (service.players.length == 0) throw new Error('no players!');

		for (var i = 0; i < service.players.length; i++) {
			if (id == service.players[i].id) return service.players[i].cards.black.length;
		}

		throw new Error('noUserId:  ' + id); //Do this if service.players.length == 0 or id not found

	};


	service.submitCard = function submitCard(card, player) {
		
		if (_.findIndex(service.roundPlayingCards, function (cardListItem) { return cardListItem.id == card.id; }) >= 0) return; //If it exists don't add it again


		for (var i = 0; i < player.cards.white.length; i++) delete player.cards.white[i].$$hashKey; //Angular adds this somewhere but idk where



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

		saveModel();
		modelChangedBroadcast();
		
	};

	service.discardCards = function discardCards() {
		for (var i = 0; i < service.roundPlayingCards.length; i++) {
			var card = service.roundPlayingCards[i];
			service.discard.push({ id: card.id, text: card.text });
		}
		service.roundPlayingCards = [];

		saveModel();
		modelChangedBroadcast();

	};

	service.assignCards = function assignCards() {

		if (service.players.length <= 0) {
			throw new Error('No players to assign cards to');
		}

		for (var i = 0; i < service.players.length * NUM_CARDS; i++) {
			service.players[i % service.players.length].cards.white.push(service.getWhiteCard());
		}

		saveModel();
		modelChangedBroadcast();

	};

	service.giveMissingWhiteCards = function giveMissingWhiteCards() {
		if (service.players.length <= 0) {
			throw new Error('No players to assign cards to');
		}

		for (var i = 0; i < service.players.length; i++) {

			if (service.players[i].cards.white.length < NUM_CARDS) {
				service.players[i].cards.white.push(service.getWhiteCard());
			}
		}

		saveModel();
		modelChangedBroadcast();
	};

	service.getWhiteCard = function getWhiteCard() {
		if (service.availableCards.white.length <= 0) { service.reshuffle(); }
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

	service.getPlayerById = function getPlayerById(id) {

		return _.find(service.players, function (player) { return player.id == id; });
	
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

		service.player = player;
		saveModel();
		modelChangedBroadcast();
	};

	function modelChangedBroadcast() {
		$rootScope.$broadcast('MODEL_CHANGED', {
			discard: service.discard, //Needed to prevent reshuffle inconsistencies
			players: service.players, //Needed to sync scores and taken out cards
			roundPlayingCards: service.roundPlayingCards, //Needed for the judge to judge
			roundJudgingCard: service.roundJudgingCard,
			availableCards: service.availableCards, //Needed so somebody doesn't pull a card someone else has
			stage: service.stage,
			judgeIndex: service.judgeIndex
		});
	}

	service.addBlackCardToPlayerById = function addBlackCardToPlayerById(id, card) {

		if (!card.pick) {
			$log.error('Cannot add white cards to black card field.');
			return;
		}

		var player = service.getPlayerById(id);

		if (!player) {
			throw new Error('No player with id: ' + id);
		}

		player.cards.black.push(card);

		saveModel();
		modelChangedBroadcast();

	};

	function modelChanged(newValue) {

		$log.info('Device model changed, yay!');

		service.discard = newValue.discard ? newValue.discard : [];
		service.players = newValue.players ? newValue.players : [];
		service.player = newValue.players ? service.getPlayerById(service.player.id) : service.player;
		service.roundPlayingCards = newValue.roundPlayingCards ? newValue.roundPlayingCards : [];
		service.roundJudgingCard = newValue.roundJudgingCard ? newValue.roundJudgingCard : { text: '', id: 0 };
		service.availableCards = newValue.availableCards ? newValue.availableCards : _.cloneDeep(service.allCards);
		service.judgeIndex = newValue.judgeIndex ? newValue.judgeIndex : 0;

		// $log.debug('GAME STARTING DEBUG');
		// $log.debug(service.stage);
		// $log.debug(newValue.stage);
		// $log.debug(service.stage == 'start');
		// $log.debug(newValue.stage == 'picking');

		if (service.stage == 'start' && newValue.stage == 'picking') {
			$rootScope.$broadcast('PICKING_PHASE'); //Game wasn't in progress but now is so broadcast start
		}

		if (service.stage == 'picking' && newValue.stage == 'judging') {
			$rootScope.$broadcast('JUDGING_PHASE');
		}

		if (service.stage == 'judging') {
			switch (newValue.stage) {
				case 'end':
					$rootScope.$broadcast('END_PHASE');
					break;
				case 'picking':
					$rootScope.$broadcast('PICKING_PHASE'); //Pretty sure a bug is introduced in a race condition here.
					break;
			}
		}

		if (service.stage == 'end' && newValue.stage == 'start') {
			$rootScope.$broadcast('START_PHASE');
		}




		service.stage = newValue.stage ? newValue.stage : 'start';

		modelChangedBroadcast();
	}


	function inboundMessage(msg) { }

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

				service.discard = data.discard ? data.discard : [];
				service.players = data.players ? data.players : [];
				service.roundPlayingCards = data.roundPlayingCards ? data.roundPlayingCards : [];
				service.roundJudgingCard = data.roundJudgingCard ? data.roundJudgingCard : { text: '', id: 0 };
				service.availableCards = data.availableCards ? data.availableCards : _.cloneDeep(service.allCards);
				service.availableCards.white = _.shuffle(service.availableCards.white);
				service.availableCards.black = _.shuffle(service.availableCards.black);
				service.stage = data.stage ? data.stage : 'start';
				service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;

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

	function saveModel() {

		stripBullshit(); 

		ogAPI.model = {
			discard: service.discard, //Needed to prevent reshuffle inconsistencies
			players: service.players, //Needed to sync scores and taken out cards
			roundPlayingCards: service.roundPlayingCards, //Needed for the judge to judge
			roundJudgingCard: service.roundJudgingCard, //Needed for black card to spread around
			availableCards: service.availableCards, //Needed so somebody doesn't pull a card someone else has
			stage: service.stage,
			judgeIndex: service.judgeIndex
		};

		ogAPI.save()
			.then(function (response) {
				$log.debug('Save was cool');
			})
			.catch(function (err) {
				// $log.error(err);
				$log.error('WTF?!?!?');
			});
		
	}


	initialize();

	service.clearGame = function clearGame() {

		service.discard = [];
		service.player = {};
		service.players = [];
		service.roundPlayingCards = [];
		service.roundJudgingCard = { text: '', id: 0 };
		service.judgeIndex = 0;
		service.availableCards = _.cloneDeep(service.allCards);
		service.availableCards.white = _.shuffle(service.availableCards.white);
		service.availableCards.black = _.shuffle(service.availableCards.black);
		service.stage = 'start';
		$rootScope.$broadcast('START_PHASE');
		saveModel();
		modelChangedBroadcast();

	};


	return service;
});