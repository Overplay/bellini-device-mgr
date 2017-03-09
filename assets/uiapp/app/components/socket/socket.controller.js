/**
 * Created by mkahn on 1/16/17.
 */


app.controller( "socketDashController", function ( $scope, $log, $http, toastr ) {


    $http.get( '/socketconnection/rooms' )
        .then( function ( resp ) {
            $scope.rooms = resp.data;
        } )
        .catch( function ( err ) {
            $log.error( "Couldn't get rooms." );
        } )


    $scope.dm = function ( roomName ) {
        var dudid = roomName.replace( 'device_', '' );

        io.socket.post( '/ogdevice/dm', {
            deviceUDID: dudid,
            message: { dest: dudid, action: 'test', payload: 'hello from cloud' }
        }, function ( resData, jwres ) {
        
            if (jwres.statusCode==200)
                toastr.success("Looking Good!");
            else
                toastr.error("Something bad happened");

            console.log( resData );
        } );

    }


} );

app.controller( 'socketController', function ( $scope, $log ) {

    $log.debug( "Loading socketController" );

    io.socket.on( 'hello', function ( data ) {
        console.log( 'Socket `' + data.id + '` joined the party!' );
        $scope.$apply( function () {
            $scope.rxs.push( 'Socket `' + data.id + '` joined the party at ' + new Date() );
        } )
    } );

    $scope.subscribe = function () {

        // And use `io.socket.get()` to send a request to the server:
        io.socket.get( '/say/hello', function gotResponse( data, jwRes ) {
            console.log( 'Server responded with status code ' + jwRes.statusCode + ' and data: ', data );
        } );

    };


    //------------------------------------------------//

    io.socket.on( 'venue', function ( data ) {
        console.log( 'Venue change for `' + data.id );
    } );

    io.socket.get( '/api/v1/venue/58b65d5d4f2c25da87dbe213', function ( resData, jwres ) {
        console.log( resData );
    } );

    io.socket.post( '/appdata/subscribe', { deviceUDID: "testudid", appid: "io.og.test" }, function ( resData, jwres ) {
        console.log( resData );
    } );

    io.socket.on( 'appdata', function ( data ) {
        console.log( 'AppData change for `' + data.id );
    } );


    io.socket.on( 'DEV-DM', function ( data ) {
        console.log( 'Message for `' + data );
        $scope.$apply( function () {
            $scope.rxs.push( 'DM received' );
        } )
    } );

    io.socket.on( 'DEV-JOIN', function ( data ) {
        console.log( 'Message for `' + data );
        $scope.$apply( function () {
            $scope.rxs.push( 'DM room joined' );
        } )
    } );

    io.socket.post( '/ogdevice/joinroom', { deviceUDID: "testudid" }, function ( resData, jwres ) {
        console.log( resData );
    } );

    $scope.dm = function () {
        io.socket.post( '/ogdevice/dm', {
            deviceUDID: "testudid",
            message:    "Time is: " + new Date()
        }, function ( resData, jwres ) {
            console.log( resData );
        } );
    };


    $scope.rxs = [];


} );