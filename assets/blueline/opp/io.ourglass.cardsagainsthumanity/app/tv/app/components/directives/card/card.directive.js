

app.directive('card', function ($log) {
	return {
		restrict: 'E',
		css: 'app/components/directives/card/card.style.css',
		scope: {
			text: '<', //if empty, card will not show
			cid: '<', //not required but suggested
			white: '<', //not required. Defaults to black
			submitted: '<', //not required. Defaults to 'ourglass'
			cardHeight: '<', //optional
			cardWidth: '<' //optional
		},
		templateUrl: 'app/components/directives/card/card.partial.html',
		link: function (scope, element, attrs) {
			scope.debugMode = false;
			$log.debug("Card directive entered");
			if (!scope.cardWidth) scope.cardWidth = '100px';
			if (!scope.cardHeight) scope.cardHeight = '140px';
		}
	};
});