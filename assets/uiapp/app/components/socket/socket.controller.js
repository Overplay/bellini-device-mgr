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

    io.socket.on( 'venue', function ( data ) {
        console.log( 'Venue change for `' + data.id  );
    } );

    io.socket.get( '/api/v1/venue/58b65d5d4f2c25da87dbe213', function ( resData, jwres )
        {
            console.log( resData );
        } );

    io.socket.post('/appdata/subscribe', { deviceUDID: "testudid", appid:"io.og.test"}, function ( resData, jwres ) {
            console.log(resData);
    });

    io.socket.on( 'appdata', function ( data ) {
        console.log( 'AppData change for `' + data.id );
    } );

    $scope.subscribe = function() {

        // And use `io.socket.get()` to send a request to the server:
        io.socket.get( '/say/hello', function gotResponse( data, jwRes ) {
            console.log( 'Server responded with status code ' + jwRes.statusCode + ' and data: ', data );
        } );

    };

    $scope.rxs = [];


});