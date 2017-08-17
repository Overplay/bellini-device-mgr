

app.directive('card', function ($log) {
	return {
		restrict: 'E',
		css: 'app/components/directives/card/card.style.css',
		scope: {
			text: '=',
			cid: '=',
			white: '='
		},
		templateUrl: 'app/components/directives/card/card.partial.html',
		link: function (scope, element, attrs) {
			scope.debugMode = false;
			$log.debug("Card directive entered");

		}
	};
});