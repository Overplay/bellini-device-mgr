app.factory('cah', function () {
	var service = {};

	var NUM_CARDS = 4;

	service.players = {};

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
				id: 0
			},
			{
				text: "_____ is about as friendly as they come.",
				id: 1
			},
			{
				text: "_____ will get the job done.",
				id: 2
			}, 
			{
				text: "_____ will ridicule you until you cry.",
				id: 3
			}
		]

	};

	service.availableCards = _.clone(service.allCards);
	service.playingCards = []; //One of these will look like {id: 0, text: "123", submittedBy: {name: 'Logan', id: 0}}
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
		
		if (_.findIndex(playingCards, function (card) { return card.id == id; }) < 0) return;

		service.playingCards.push({
			id: id,
			text: text,
			submittedBy: {
				name: player.name,
				id: player.id
			}
		});

		$rootScope.$broadcast('PLAYING_CARDS_CHANGED', service.playingCards)

	};

	service.discardCards = function discardCards() {
		for (var i = 0; i < service.playingCards.length; i++) {
			var card = service.playingCards[i];
			service.discard.push({ id: card.id, text: card.text });
		}
		service.playingCards = [];

		$rootScope.$broadcast('PLAYING_CARDS_CHANGED', service.playingCards);
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
	}

	service.reshuffle = function reshuffle() {
		if (service.discard.length <= 0) {
			throw Error("No cards to reshuffle!");
		}

		for (var i = 0; i < service.discard.length; i++) { 

			service.availableCards.push(service.discard[0]);

		}

		service.discard = [];
		//As of right now, I don't think we need to tell the client we put cards from default to available.
		
	}



	return service;
});