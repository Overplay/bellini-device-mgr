/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell',
    function ( $log, ogAPI, uibHelper, $http, $rootScope, $timeout ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '=',
                search: '=',
                nowPlaying: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {

                if (attrs.nowPlaying) {
                    $log.debug("nowPlaying is defined!!");
                    scope.nowPlaying = attrs.nowPlaying;
                }

                scope.changeChannel = function () {
                    // uibHelper.confirmModal("Change Channel?", "Would you like to change to channel " +
                    // scope.grid.channel.channelNumber + "?", true) .then(function(){ $log.debug( "Changing channel
                    // to: " + scope.grid.channel.channelNumber ); ogProgramGuide.changeChannel(
                    // scope.grid.channel.channelNumber ); $rootScope.currentChannel = scope.grid; })

                    var hud = uibHelper.curtainModal( 'Changing...' );
                    $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                    ogAPI.changeChannel( scope.grid.channel.channelNumber );
                    $rootScope.currentChannel = scope.grid;
                    //$timeout(function(){ hud.dismiss() }, 5000);

                }

                // timeStr is utc time, so we need to add the proper offset for our TZ
                // For now, we'll just hack it
                scope.displayTime = function (timeStr) {
                    //var parsedTimeStr = moment(timeStr); //Use Moment.js to parse
                    var parsedTimeStr = moment(timeStr+'Z'); // make UTC since it comes with no TZ info
                    var date = parsedTimeStr.toDate();
                    var hour = (date.getHours() > 12 ? date.getHours() - 12 : date.getHours());
                    var min = date.getMinutes();

                    if (isNaN(hour)) return "On Later";
                    return hour + ':' + (min < 10 ? '0' + min : min);
                };


                scope.favoriteChannel = function ( channel ) {
                    if (channel.favorite) {
                        uibHelper.confirmModal("Remove from favorites?", "Would you like to remove this channel from your favorites?", true)
                            .then(function(){
                                removeFavorite(channel.channelNumber);
                                locallyChangeFavorite(channel, false);
                            })
                    } else {
                        uibHelper.confirmModal("Add to favorites?", "Would you like to add this channel to your favorites?", true)
                            .then(function() {
                                addFavorite(channel.channelNumber);
                                locallyChangeFavorite(channel, true);
                            })
                    }
                };

                var locallyChangeFavorite = function (channel, changeTo) {
                    var localGrid = JSON.parse( localStorage.getItem("grid") );

                    if ( localGrid ) {
                        for (var i = 0; i < localGrid.length; i++) {
                            if (localGrid[i].channel.channelNumber == channel.channelNumber) {
                                localGrid[i].channel.favorite = changeTo;
                                scope.grid.channel.favorite = changeTo;
                                $log.debug('channel favorite changed locally');

                                localStorage.setItem('grid', JSON.stringify( localGrid ));

                                return true;
                            }
                        }
                    }

                    $log.error('unable to find channel to change favorite locally');
                    return false;
                };

                var addFavorite = function ( channelNum ) {
                    $http.post( "/api/channel/favorite/" + channelNum )
                        .then( function successCallback() {
                            $log.info('channel added to favorites');
                        }, function errorCallback() {
                            $log.error('error adding channel to favorites');
                        });
                };

                var removeFavorite = function ( channelNum ) {
                    $http.post( "/api/channel/favorite/" + channelNum + "?clear=true" )
                        .then( function successCallback() {
                            $log.info('channel removed from favorites');
                        }, function errorCallback() {
                            $log.error('error removing channel from favorites');
                        });
                };

            }
        }
    }
);