

app.directive('card', function (cah, $log) {
	return {
		restrict: 'E',
		css: 'app/components/card/card.style.css',
		scope: {
			text: '=',
			id: '=',
			white: '='
		},
		templateUrl: 'app/components/card/card.partial.html',
		link: function (scope, element, attrs) {
			scope.debugMode = false;
			$log.debug("Card directive entered");

		}
	};
});