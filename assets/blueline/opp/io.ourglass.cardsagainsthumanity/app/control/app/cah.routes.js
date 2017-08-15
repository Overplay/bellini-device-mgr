app.config(function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/start');
	$stateProvider
		.state('start', {
			url: "/start",
			templateUrl: 'app/components/start/start.partial.html',
			controller: 'startController'
		})
		.state('picking', {
			url: '/picking',
			templateUrl: 'app/components/picking/picking.partial.html',
			controller: 'pickingController'
		})
		.state('judging', {
			url: '/judging',
			templateUrl: 'app/components/judging/judging.partial.html',
			controller: 'judgingController'
		})
		.state('allcards', {
			url: '/allcards',
			templateUrl: 'app/components/allcards/allcards.partial.html',
			controller: 'allCardsController'
		});
});