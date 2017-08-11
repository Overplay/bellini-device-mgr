app.factory('cah', function ($rootScope, $log, ogAPI) {
	var service = {};

	var NUM_CARDS = 2;

	service.allCards = {

		white: [
			{
				text: "Alexa",
				id: 0
			},
			{
				text: "Logan",
				id: 1
			},
			{
				text: "Catherine",
				id: 2
			},
			{
				text: "Melissa",
				id: 3
			},
			{
				text: "Treb",
				id: 4
			},
			{
				text: "Kristin",
				id: 5
			},
			{
				text: "Mitch",
				id: 6
			},
			{
				text: "Goldie",
				id: 7
			},
			{
				text: "Mike",
				id: 8
			},
			{
				text: "Noah",
				id: 9
			}
		],

		black: [
			{
				text: "_____ has the biggest nose in the game.",
				cardsRequired: 1,
				id: 0
			},
			{
				text: "_____ is about as friendly as they come.",
				cardsRequired: 1,
				id: 1
			},
			{
				text: "_____ will get the job done.",
				cardsRequired: 1,
				id: 2
			}, 
			{
				text: "_____ will ridicule you until you cry.",
				cardsRequired: 1,
				id: 3
			}
		]

	};

	service.availableCards = _.cloneDeep(service.allCards);
	service.gameInProgress = false;
	_.shuffle(service.availableCards.white);
	_.shuffle(service.availableCards.black);
	service.roundPlayingCards = []; //One of these will look like {id: 0, text: "123", submittedBy: {name: 'Logan', id: 0}}
	service.discard = []; //This will just be {id: 0, text: 'someText'}
	service.players = []; //A player will look like        { id: 0, cards: {white: [], black: []}, name: "Logan" }
	service.player = {};

	service.getPlayerScoreForId = function getPlayerScoreForId(id) {

		if (service.players.length == 0) throw new Error("no players!");

		for (var i = 0; i < service.players.length; i++) {
			if (id == service.players[i].id) return service.players[i].cards.black.length;
		}

		throw new Error("noUserId:  " + id) ; //Do this if service.players.length == 0 or id not found

	};


	service.submitCard = function submitCard({ id, text }, { player }) {
		
		if (_.findIndex(service.roundPlayingCards, function (card) { return card.id == id; }) < 0) return;

		service.roundPlayingCards.push({
			id: id,
			text: text,
			submittedBy: {
				name: player.name,
				id: player.id
			}
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
			throw new Error("No players to assign cards to");
		}

		for (var i = 0; i < service.players.length * NUM_CARDS; i++) {
			service.players[i % service.players.length].cards.white.push(service.getCard());
		}

		modelChangedBroadcast();

	};

	service.getCard = function getCard() {
		if (service.availableCards.white.length <= 0) service.reshuffle();
		modelChangedBroadcast();
		return service.availableCards.white.shift();
	};

	service.reshuffle = function reshuffle() {
		if (service.discard.length <= 0) {
			throw new Error("No cards to reshuffle!");
		}

		_.shuffle(service.discard);
		

		for (var i = 0; i < service.discard.length; i++) {

			service.availableCards.white.push(service.discard[i]);

		}

		service.discard = [];
		//As of right now, I don't think we need to tell the client we put cards from default to available.
		
	};

	service.getPlayerById = function getPlayerById(id) {

		return _.find(service.players, function (player) { return player.id == id; });
	
	};

	service.addPlayer = function addPlayer(name) {

		if (service.gameInProgress) throw new Error("The game you tried to join is in progress"); //Game is running

		if (!name) throw new Error("No name provided"); //No name provided

		if (_.findIndex(service.players, function (player) {
			return player.name === name;
		}) >= 0) throw new Error("That name is taken."); //Someone with that name exists

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
		modelChangedBroadcast();
		saveModel();
	};

	function modelChangedBroadcast() {
		$rootScope.$broadcast('MODEL_CHANGED', {
			discard: service.discard, //Needed to prevent reshuffle inconsistencies
			players: service.players, //Needed to sync scores and taken out cards
			roundPlayingCards: service.roundPlayingCards, //Needed for the judge to judge
			availableCards: service.availableCards, //Needed so somebody doesn't pull a card someone else has
			gameInProgress: service.gameInProgress,
			judgeIndex: service.judgeIndex
		});
	}

	service.addBlackCardToPlayerById = function addBlackCardToPlayerById(id, card) {

		if (!card.cardsRequired) {
			$log.error("Cannot add white cards to black card field.");
			return;
		}

		var player = service.getPlayerById(id);

		if (!player) {
			throw new Error("No player with id: " + id);
		}

		player.cards.black.push(id, card);

		modelChangedBroadcast();

	};

	service.startGame = function startGame() {

		service.assignCards();
		service.gameInProgress = true;
		modelChangedBroadcast();
		saveModel();

	};


	function modelChanged(newValue) {

		$log.info("Device model changed, yay!");

		service.discard = newValue.discard ? newValue.discard : [];
		service.players = newValue.players ? newValue.players : [];
		service.roundPlayingCards = newValue.roundPlayingCards ? newValue.roundPlayingCards : [];
		service.availableCards = newValue.availableCards ? newValue.availableCards : _.cloneDeep(service.allCards);
		service.judgeIndex = newValue.judgeIndex ? newValue.judgeIndex : 0;

		if (!service.gameInProgress && newValue.gameInProgress) { 
			$rootScope.$broadcast('GAME_START'); //Game wasn't in progress but now is so broadcast start
		}

		service.gameInProgress = newValue.gameInProgress ? newValue.gameInProgress : false;

		modelChangedBroadcast();




	}


	function inboundMessage(msg) {
		$log.info("New message: " + msg);
		$scope.ogsystem = msg;
	}

	function initialize() {

		$log.debug("initializing app and data");

		ogAPI.init({
			appName: "io.ourglass.cardsagainsthumanity",
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
			service.availableCards = data.availableCards ? data.availableCards : _.cloneDeep(service.allCards); 
			_.shuffle(service.availableCards.white);
			_.shuffle(service.availableCards.black);
			service.gameInProgress = data.gameInProgress ? data.gameInProgress : false;
			service.judgeIndex = data.judgeIndex ? data.judgeIndex : 0;

			modelChangedBroadcast();

		})
		.catch(function (err) {
			$log.error("Something failed: " + err);
		});

	}

	function saveModel() {

		ogAPI.model = {
			discard: service.discard, //Needed to prevent reshuffle inconsistencies
			players: service.players, //Needed to sync scores and taken out cards
			roundPlayingCards: service.roundPlayingCards, //Needed for the judge to judge
			availableCards: service.availableCards, //Needed so somebody doesn't pull a card someone else has
			gameInProgress: service.gameInProgress,
			judgeIndex: service.judgeIndex
		};

		ogAPI.save()
			.then(function (response) {
				$log.debug("Save was cool");
			})
			.catch(function (err) {
				$log.error("WTF?!?!?");
			});
		
	}


	initialize();

	service.clearGame = function clearGame() {

		service.discard = [];
		service.players = [];
		service.roundPlayingCards = [];
		service.judgeIndex = 0;
		service.availableCards = _.cloneDeep(service.allCards);
		_.shuffle(service.availableCards.white);
		service.gameInProgress = false;
		saveModel();

	};


	return service;
});