/**
 * Created by logansaso on 6/23/16.
 */


//PARTY JSON OBJECT
// {
// 	    'name' : 'Name of El Partay',
// 		'members' : 5,
// 		'dateCreated': new Date()
// }

app.controller('cahController', ['$scope', 'ogAPI', '$log', '$timeout', 'cah',
	function ($scope, ogAPI, $log, $timeout, cah) {



	$scope.title = "Cards Against Humanity";

	// $scope.previousWinningCard = { text: '', id: 0 };
	$scope.getWinner = cah.getWinner;

	$scope.$on('MODEL_CHANGED', function () { 
		if ($scope.stage != 'picking' && cah.stage == 'picking') { //From a non-picking stage to a picking stage
			if (cah.previousWinningCard) {
				$scope.previousWinningCard = cah.previousWinningCard ? cah.previousWinningCard : { text: '', id: 0 }
				$scope.previousJudgingCard = cah.previousJudgingCard ? cah.previousJudgingCard : { text: '', id: 0, pick: 1 }
				$scope.showPreviousRound = true;
				$timeout(function () { 
					$scope.showPreviousRound = false;
				}, 20 * 1000)
			}
		}
		$scope.discard = cah.discard ? cah.discard : [];
		$scope.players = cah.players ? cah.players : [];
		$scope.roundPlayingCards = cah.roundPlayingCards ? cah.roundPlayingCards : [];
		$scope.roundJudgingCard = cah.roundJudgingCard ? cah.roundJudgingCard : { text: '', id: 0 };
		$scope.judgeIndex = cah.judgeIndex ? cah.judgeIndex : 0;
		$scope.stage = cah.stage ? cah.stage : 'start';

	})


	$scope.rotation = 0;
	function doRotation() {
		$timeout(function () {
			$scope.rotation++;
			doRotation();
		}, 10 * 1000);
	}

	doRotation();


}]);



app.directive('topScrollerJankFree', [
	'$log', '$timeout', '$window', '$interval',
	function ($log, $timeout, $window, $interval) {
		return {
			restrict: 'E',
			scope: {
				cards: '=',
				title: '='
			},
			templateUrl: 'app/components/directives/cah.template.html',
			link: function (scope, elem, attrs) {

				var listHeight, windowHeight, cellHeight;

				try{
					if (scope.cards.length <= 5) {
						setNoMovement();
					} else {
						resetCrawlerTransition();
					}
				} catch (err)
				{
					resetCrawlerTransition();
				}

				/*
				 Speed needs to be implemented
				 scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

				 scope.logo should be the path to the logo to show on the left side
				 scope.bannerAd should be the path to a full banner add to be shown periodically

				 none of these are implemented yet


				 */

				var wasPaused = false;
				var distanceNeeded;
				var currentLocation;
				var transitionTime = 1; //In seconds. MUST BE LOWER THAN stepDelay
				var stepDelay = 2; //In seconds

				// This is on a scope var for debugging on Android
				scope.screen = {height: $window.innerHeight, width: $window.innerWidth};


				function setScrollHeight() {
					var outerFrame = document.getElementById("outer-frame");
					var scrollWindow = document.getElementById("scroll-window");

					var newHeight = Math.floor(outerFrame.offsetHeight / cellHeight) * cellHeight;
					$log.info("newHeight: " + newHeight);
					scrollWindow.setAttribute("style", "height: " + newHeight + "px");
					$log.info("new scroll ht: " + scrollWindow.offsetHeight);
				}

				// Dump crawler off screen
				function resetCrawlerTransition() {
					wasPaused = false;
					scope.topPos = {
						'-webkit-transform': "translate(0px, " + (Math.ceil(windowHeight / cellHeight) * cellHeight) + 'px)',
						'transform': "translate(0px, " + (Math.ceil(windowHeight / cellHeight) * cellHeight) + 'px)',
						'transition': 'all 0s'
					};

				}


				function outerLoop() {


					$timeout(loop, stepDelay * 1000);


				}

				function setNoMovement() {
					wasPaused = true;
					scope.topPos = {
						'-webkit-transform': "translate(0px, 0px)",
						'transform': "translate(0px, 0px)",
						'transition': "all 0s linear"
					};
				}

				function loop() {

					if (scope.cards.length <= Math.floor(windowHeight / cellHeight)) {
						// if the number of cards is less than the available window space
						// then don't scroll
						setNoMovement();
						doScroll();
						return;
					}

					if(wasPaused){
						resetCrawlerTransition();
						doScroll();
						return;
					}

					// $log.info("Doing loop.");


					currentLocation = currentLocation - cellHeight;
					$log.debug( "new currentLocation: " + currentLocation );
					$log.debug( "currLoc / cellHeight: " + (currentLocation / cellHeight));

					scope.topPos = {
						'-webkit-transform': "translate(0px, " + currentLocation + "px)",
						'transform': "translate(0px, " + currentLocation + "px)",
						'transition': "all " + transitionTime + "s linear"
					};

					if (-currentLocation >= distanceNeeded) {
						console.log('Done!');
						doScroll();
						return;
					}

					outerLoop();

				}


				// This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
				function loadListHeight() {
					return $timeout(function () {
						return document.getElementById('card-container').offsetHeight;
					})
				}

				function loadWindowHeight(){
					return $timeout( function () {
						return document.getElementById( 'scroll-window' ).offsetHeight;
					} )
				}

				function loadCellHeight(){
					return $timeout(function () {
						var cellHt = 0;
						if (scope.cards.length) {
							var elem = document.getElementById('scroll0'); // should maybe be changed from scroll0 to generic
							var style = elem.currentStyle || window.getComputedStyle(elem);
							cellHt = elem.offsetHeight + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
							$log.debug("loadCellHeight found: " + cellHt);
						} else {
							$log.debug("loadCellHeight not found - no cards");
						}
						return cellHt;
					});
				}


				function scroll(){

					$log.debug( "List height: " + listHeight );
					$log.debug( "Window height: " + windowHeight);

					currentLocation = windowHeight;
					$log.debug( "currentLocation at start: " + currentLocation );
					distanceNeeded = listHeight + cellHeight;
					try {
						if (scope.cards.length > Math.floor(windowHeight / cellHeight)) {
							resetCrawlerTransition();
						} else {
							setNoMovement();
						}
					} catch ( err ) {
						$log.error( err.message );
						//$timeout(doScroll(), 1000);
						//Due to the fact that scope.cards() probably has nothing in it yet
					}
					outerLoop();
				}


				function doScroll() {

					loadListHeight()
						.then(function (height) {
							listHeight = height;

							return loadCellHeight();
						})
						.then ( function(cell) {
							if ( scope.cards.length ){
								cellHeight = cell;
							} else {
								cellHeight = 0; // no cards
							}

							setScrollHeight();

							$log.debug("Cell height: " + cellHeight);
							return loadWindowHeight();
						})
						.then( function(height){
							windowHeight = height;
							scroll();
						});
					
				}

				doScroll();

			}
		}
	}]
);
