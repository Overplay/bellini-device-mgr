/**
 * Created by mkahn on 1/16/17.
 */

app.controller('socketController', function($scope, $log){

    $log.debug("Loading socketController");

    io.socket.on( 'hello', function ( data ) {
        console.log( 'Socket `' + data.id + '` joined the party!' );
        $scope.$apply( function(){
            $scope.rxs.push( 'Socket `' + data.id + '` joined the party at ' + new Date() );
        })
    } );

    $scope.subscribe = function() {

        // And use `io.socket.get()` to send a request to the server:
        io.socket.get( '/say/hello', function gotResponse( data, jwRes ) {
            console.log( 'Server responded with status code ' + jwRes.statusCode + ' and data: ', data );
        } );

    };

    $scope.rxs = [];


});