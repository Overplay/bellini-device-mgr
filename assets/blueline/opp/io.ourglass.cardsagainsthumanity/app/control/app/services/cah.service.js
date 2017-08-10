app.factory('cah', function ($rootScope, $log, ogAPI) {
	var service = {};

	var NUM_CARDS = 4;

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
	shuffle(service.availableCards.white);
	shuffle(service.availableCards.black);
	service.roundPlayingCards = []; //One of these will look like {id: 0, text: "123", submittedBy: {name: 'Logan', id: 0}}
	service.discard = []; //This will just be {id: 0, text: 'someText'}
	service.players = []; //A player will look like        { id: 0, cards: {white: [], black: []}, name: "Logan" }

	service.getPlayerScoreForId = function getPlayerScoreForId(id) {

		if (service.players.length == 0) throw Error("no players!");

		for (var i = 0; i < service.players.length; i++) {
			if (id == service.players[i].id) return service.players[i].cards.black.length;
		}

		throw Error("noUserId:  " + id) ; //Do this if service.players.length == 0 or id not found

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

		$rootScope.$broadcast('PLAYING_CARDS_CHANGED', service.roundPlayingCards);

	};

	service.discardCards = function discardCards() {
		for (var i = 0; i < service.roundPlayingCards.length; i++) {
			var card = service.roundPlayingCards[i];
			service.discard.push({ id: card.id, text: card.text });
		}
		service.roundPlayingCards = [];

		$rootScope.$broadcast('PLAYING_CARDS_CHANGED', service.roundPlayingCards);
	};

	service.assignCards = function assignCards() {

		if (service.players.length <= 0) {
			throw Error("No players to assign cards to");
		}

		for (var i = 0; i < service.players.length * NUM_CARDS; i++) {
			service.players[i % service.players.length].white.push(service.getCard());
		}

	};

	service.getCard = function getCard() {
		if (service.availableCards.length <= 0) service.reshuffle();
		$rootScope.$broadcast('AVAIL_CARDS_CHANGED')
		return service.availableCards.shift();
	};

	service.reshuffle = function reshuffle() {
		if (service.discard.length <= 0) {
			throw Error("No cards to reshuffle!");
		}

		shuffle(service.availableCards);

		for (var i = 0; i < service.discard.length; i++) {

			service.availableCards.push(service.discard[0]);

		}

		service.discard = [];
		//As of right now, I don't think we need to tell the client we put cards from default to available.
		
	};

	service.getPlayerById = function getPlayerById(id) {

		return _.find(service.players, function (player) { return player.id == id });
	
	}

	service.addPlayer = function addPlayer(name) {
		var player = {
			id: service.players.length,
			cards: {
				white: [],
				black: []
			},
			name: name
		}

		service.players.push(player);

		$rootScope.$broadcast('PLAYER_CHANGED', player);
		$rootScope.$broadcast('PLAYERS_CHANGED', service.players)
	}

	service.addBlackCardToPlayerById = function addBlackCardToPlayerById(id, card) {

		if (!card.cardsRequired) {
			$log.error("Cannot add white cards to black card field.");
			return;
		}

		var player = service.getPlayerById(id);

		if (!player) {
			throw Error("No player with id: " + id);
		}

		player.cards.black.push(id, card)

		$rootScope.$broadcast('PLAYER_CHANGED', player);

	}



	//Fisher-Yates (or Knuth) Shuffle, taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array; //This returns because it is convenient but the shuffle happens in place so shuffle(array) is sufficient
	}


	function modelChanged(newValue) {
		$log.info("Device model changed, yay!");



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
				service.availableCards = data.availableCards ? data.availableCards : _.clone(service.allCards); 
				shuffle(service.availableCards);

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
			availableCards: service.availableCards //Needed so somebody doesn't pull a card someone else has
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




	return service;
});