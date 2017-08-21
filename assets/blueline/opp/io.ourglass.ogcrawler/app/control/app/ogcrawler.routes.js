app.config(function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/messages');
	$stateProvider
		.state('messages', {
			url: "/messages",
			templateUrl: 'app/components/messages/messages.partial.html',
			controller: 'messagesController'
		})
		.state('twitter', {
			url: '/twitter',
			templateUrl: 'app/components/twitter/twitter.partial.html',
			controller: 'twitterController'
		})
});