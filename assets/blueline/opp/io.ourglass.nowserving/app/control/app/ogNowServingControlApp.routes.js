app.config(function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/home');
	$stateProvider
		.state('home', {
			url: "/home",
			templateUrl: 'app/components/controlscreen/controlscreen.partial.html',
			controller: 'homeController'
		})
		.state('settings', {
			url: "/settings",
			templateUrl: 'app/components/settings/settings.partial.html',
			controller: 'settingsController'
		});
});