

app.directive('card', function (cah, $log) {
	return {
		restrict: 'E',
		css: 'app/components/card/card.style.css',
		scope: {
			text: '=',
			id: '='
		},
		templateUrl: 'app/components/card/card.partial.html',
		link: function (scope, element, attrs) {

			$log.debug("Card directive entered");

		}
	};
});