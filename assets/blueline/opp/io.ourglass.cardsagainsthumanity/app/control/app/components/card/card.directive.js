

app.directive('card', function (cah) { 
	return {
		restrict: 'E',
		scope: {
			text: '='
		},
		templateUrl: 'card.partial.html',
		link: function (scope, element, attrs) { 

		}
	}
})