/**
 * Created by mkahn on 9/14/17.
 */


app.factory('dataModel', function( $log, ogAPI, $rootScope ){

    $log.debug("loading dataModel");

    var service = {};
    var _useVenueData;

    function initialize() {

        ogAPI.init( {
            appType:             'mobile',
            appName:             "io.ourglass.ogcrawler",
            endpoint:            "control",
            deviceUDID:          "test",
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
        if (_useVenueData !== data.useVenueData)
            $rootScope.$broadcast('DATA_SOURCE_CHANGED');

        _useVenueData = data.useVenueData;
    }

    function venueModelUpdate( data ) {
        $log.debug( "Inbound venue data model change." );

    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    service.getData = function(){
        if (_useVenueData) {
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
        if ( _useVenueData ) {
            ogAPI.venueModel.messages.push(message);
        } else {
            ogAPI.model.messages.push( message );
        }
    };

    service.setHzMessages = function(msgArray){
        if ( _useVenueData ) {
            ogAPI.venueModel.messages = msgArray;
        } else {
            ogAPI.model.messages = msgArray;
        }
    };


    service.setTwitterQueries = function ( queryArray ) {
        if ( _useVenueData ) {
            ogAPI.venueModel.twitterQueries = queryArray;
        } else {
            ogAPI.model.twitterQueries = queryArray;
        }
        ogAPI.updateTwitterQuery( queryArray );
    };

    service.setHideTVTweets = function ( shouldHide ) {
        if ( _useVenueData ) {
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