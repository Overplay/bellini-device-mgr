/**
 * Created by mkahn on 5/19/17.
 */

/*********************************

 File:       mainframe.service.js
 Function:   Core Functions Mimicking Bucanero
 Copyright:  Ourglass TV
 Date:       5/19/17 3:17 PM
 Author:     mkahn

 JS Version of Bucanero, basically

 **********************************/

    // TODO this should come from somewhere else!
var DEVICE_UDID = 'apple-sim-1';
var VENUE_UUID = 'da56668b-a336-443d-9f05-ec991411855b';

app.factory( 'bellini', function ( $http, $log ) {

    var service = {};


    function stripData( resp ) {
        return resp.data;
    }

    service.fullUrlForApp = function ( appId ) {
        return "/blueline/opp/" + appId + "/app/tv";
    }

    service.registerDeviceWithBellini = function () {
        return $http.post( "/ogdevice/register", { deviceUDID: DEVICE_UDID } )
            .then( stripData );
    }


    service.associateDeviceWithVenueUUID = function ( venueUUID ) {
        return $http.post( "/ogdevice/associateWithVenue", { deviceUDID: DEVICE_UDID, venueUUID: venueUUID } )
            .then( stripData );
    }

    service.getRegCode = function () {
        return $http.post( "/ogdevice/regcode", { deviceUDID: DEVICE_UDID } )
            .then( stripData );
    }


    service.getAppStatusFromCloud = function () {
        return $http.get( "/ogdevice/appstatus?deviceUDID=" + DEVICE_UDID )
            .then( stripData );
    }

    service.pingCloud = function () {
        return $http.get( "/ogdevice/pingcloud" )
            .then( stripData );
    }

    service.appLaunchAck = function ( appId, layoutSlot ) {

        var params = {
            deviceUDID: DEVICE_UDID,
            appId:      appId,
            layoutSlot: layoutSlot,
            command:    'launch'
        }

        return $http.post( "/ogdevice/commandack", params )
            .then( stripData );

    }

    service.appKillAck = function ( appId ) {

        var params = {
            deviceUDID: DEVICE_UDID,
            appId:      appId,
            command:    'kill'
        }

        return $http.post( "/ogdevice/commandack", params )
            .then( stripData );

    }

    service.appMoveAck = function ( appId, slot ) {

        var params = {
            deviceUDID: DEVICE_UDID,
            appId:      appId,
            slot:       slot,
            command:    'launch'
        }

        return $http.post( "/ogdevice/commandack", params )
            .then( stripData );

    }

    service.programChange = function ( newShow ) {
        return; // this is basically a logging function, right?
        //HTTPTransaction.post( OGConstants.BELLINI_DM_ADDRESS + "/ogdevice/programchange", params, null );
    }

    service.registerSTBPairing = function ( setTopBox ) {
        return; // don't think we need this
    }

    service.getMe = function () {
        return $http.get( "/ogdevice/findByUDID?deviceUDID=" + DEVICE_UDID )
            .then( stripData );

    }

    service.getVenues = function(){
        return $http.get( "/venue/all")
            .then( stripData );
    }

    service.getVenueByName = function(name){
        return service.getVenues()
            .then( function(venues){

                var matches = _.filter(venues, { 'name': name });
                if (matches && matches.length>0){
                    return matches[ 0 ]
                } else {
                    return undefined
                }


            })
    }



    return service;

} )

app.factory( 'mainframe', function ( bellini, toastr, $log, $rootScope, $q, $interval ) {

    var service = {};

    var simulatedDeviceInfo = {
        name: "Granny Smith",
        locationWithinVenue: "Shelf",
        randomFactoid: "Bunnies are cute",
        isPairedToSTB: true,
        stbIPAddress: '10.0.10.2',
        outputRes: "1280x720",
        venue: VENUE_UUID,
        udid: DEVICE_UDID
    }

    $q.all( [ bellini.registerDeviceWithBellini(), bellini.getVenueByName('Simulation Station')] )
        .then( function(res){
            //toastr.success( "Simulated Device Registered with Back End" );
            return bellini.associateDeviceWithVenueUUID(res[1].uuid);
        })
        .then( function(res){
            toastr.success( "Simulated Device Registered with Back End" );
        })
        .catch( function(err){
            toastr.error("Oh crap, couldn't venassoc");
        });

    $interval(function(){

        $http.get('ogdevice/tickle')
            .then(function(){
                $log.debug("Tickled ogcloud, hee hee.");
            })


    }, 5000);

    // bellini.registerDeviceWithBellini()
    //     .then( function ( resp ) {
    //         toastr.success( "Simulated Device Registered with Back End" );
    //         return resp;
    //     } )
    //     .then( function(reginfo){
    //
    //     });

    io.socket.on( "connect", function () {
        $log.debug( "(Re)Connecting to websockets rooms" );
        toastr.success( "Connected to Websocket Back End" );

        // joinDeviceRoom();
        // subscribeToAppData();
    } );

    io.socket.on( 'event', function ( data ) {
        $log.debug( data );
    } );

    io.socket.post( '/ogdevice/joinroom?deviceUDID=' + DEVICE_UDID, { deviceUDID: DEVICE_UDID },
        function ( resData, jwres ) {
            $log.debug( resData );

        } );

    function doDM(message){
        io.socket.post( '/ogdevice/dm?deviceUDID=' + DEVICE_UDID, message );
    }

    // Main channel from server
    io.socket.on( 'DEVICE-DM', function ( data ) {
        $log.debug( data );
        var action = data.action;

        switch ( action ){

            case 'ping':
                doDM({ message: { action: 'ping-ack'}});
                break;

            case "identify":
                doDM({ message: { action: 'ident-ack', payload: simulatedDeviceInfo }})
                break;

            case "tune":
            case "launch":
            case "kill":
            case "move":
                $rootScope.$broadcast( 'ACTION', data )
                break;

            default:
                Log.d( TAG, "Did not recognize inbound action" );

        }
    });


    return service;

})