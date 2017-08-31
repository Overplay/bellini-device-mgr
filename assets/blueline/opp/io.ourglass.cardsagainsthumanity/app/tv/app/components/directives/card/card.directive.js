

app.directive('card', function ($log, $interval, $timeout) {
	return {
		restrict: 'E',
		css: 'app/components/directives/card/card.style.css',
		scope: {
			text: '<', //if empty, card will not show
			cid: '<', //not required but suggested
			color: '<', //not required. Defaults to black
			submitted: '<', //not required. Defaults to 'ourglass'
			cardHeight: '<', //optional
			cardWidth: '<' //optional
		},
		templateUrl: 'app/components/directives/card/card.partial.html',
		link: function (scope, element, attrs) {
			if(!scope.color) scope.color = 'black';
			scope.debugMode = false;
			$log.debug("Card directive entered");
			if (!scope.cardWidth) scope.cardWidth = '100px';
			if (!scope.cardHeight) scope.cardHeight = '140px';

			
			// if (scope.text.length > 100) {
			// 	scope.text += "\n\n";
			// 	$interval(function () {
			// 		var arrText = scope.text.split(" "); 
			// 		arrText.push(arrText.shift());
			// 		scope.text = arrText.join(" ");
			// 	}, 3 * 1000)
			// }
			
			if (scope.text.length > 100) {
				$timeout(function () {
					scope.text += "\n   ";
					$interval(function () {
						var firstLetter = scope.text[0];
						scope.text = scope.text.substring(1) + firstLetter;
					}, 500)
				}, 5 * 1000)
			}

			

		}
	};
});