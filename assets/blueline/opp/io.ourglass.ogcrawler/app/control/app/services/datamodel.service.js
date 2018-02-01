/**
 * Created by mkahn on 9/14/17.
 */



app.factory('dataModel', function( $log, ogAPI, $rootScope ){

    $log.debug("loading dataModel");

    var ALWAYS_VENUE = true;

    var service = {};
    var _useVenueData;

    function initialize() {

        ogAPI.init( {
            appType:             'mobile',
            appName:             "io.ourglass.ogcrawler",
            // endpoint:            "control",
            // deviceUDID:          "test",
            deviceModelCallback: deviceModelUpdate,
            venueModelCallback:  venueModelUpdate,
            messageCallback:     inboundMessage

        } )
            .then( function ( data ) {
                $log.debug( "crawler control: init complete" );
                // deviceModelUpdate(data);
                venueModelUpdate(data.venue);
                deviceModelUpdate(data.device);
            } )
            .catch( function ( err ) {
                $log.error( "crawler controller: something bad happened: " + err );
            } );
    }

    function deviceModelUpdate( data ) {
        $log.debug("Inbound device data model change.");

        _useVenueData = data.useVenueData;
        $rootScope.$broadcast( 'REFRESH_DATA' );
    }

    function venueModelUpdate( data ) {
        $log.debug( "Inbound venue data model change." );
        $rootScope.$broadcast( 'REFRESH_DATA' );
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    service.getData = function(){


        if (ALWAYS_VENUE || _useVenueData) {
            return ogAPI.venueModel;
        } else {
            return ogAPI.model;
        }
    };

    service.setUseVenue = function(useVenue){
        ogAPI.model.useVenueData = useVenue;
        ogAPI.saveDeviceModel();

        if ( _useVenueData !== useVenue )
            $rootScope.$broadcast( 'DATA_SOURCE_CHANGED' );

        _useVenueData = useVenue;

    };

    service.addHzMessage = function(message){
        if ( ALWAYS_VENUE || _useVenueData ) {
            ogAPI.venueModel.messages.push(message);
        } else {
            ogAPI.model.messages.push( message );
        }
    };

    service.setHzMessages = function(msgArray){
        if ( ALWAYS_VENUE || _useVenueData ) {
            ogAPI.venueModel.messages = msgArray;
        } else {
            ogAPI.model.messages = msgArray;
        }
    };


    service.setTwitterQueries = function ( queryArray ) {
        if ( ALWAYS_VENUE || _useVenueData ) {
            ogAPI.venueModel.twitterQueries = queryArray;
        } else {
            ogAPI.model.twitterQueries = queryArray;
        }

        ogAPI.updateTwitterQuery( queryArray );
    };

    service.setHideTVTweets = function ( shouldHide ) {
        if ( ALWAYS_VENUE || _useVenueData ) {
            ogAPI.venueModel.hideTVTweets = shouldHide;
        } else {
            ogAPI.model.hideTVTweets = shouldHide;
        }
    };

    service.save = function(){
        return ogAPI.saveAll();
    };

    service.init = initialize;

    return service;

});