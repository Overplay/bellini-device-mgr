/**
 * Created by mkahn on 11/5/16.
 */


app.factory( 'dataSource', function ( $log, $rootScope, ogAPI, $q ) {

    var _sourceIsVenueData = true;

    var _remoteData;

    var service = {};

    service.localData = null;

    service.setSourceVenue = function ( isVenue ) {
        _sourceIsVenueData = isVenue;
    }

    service.isSourceVenue = function () {
        return _sourceIsVenueData;
    }

    service.toggleSource = function () {
        _sourceIsVenueData = !_sourceIsVenueData;
        changeDataSource();
        return _sourceIsVenueData;
    }

    // We shouldn't need to refetch since SocketIO should be keeping these in tune
    function changeDataSource() {

        if ( _sourceIsVenueData ) {
            service.localData = ogAPI.venueModel;
        } else {
            service.localData = ogAPI.model;
        }

        announceNewRemoteData();

    }

    /**
     * Called from ogAPI directly
     * @param newData
     */
    service.venueUpdate = function ( newData ) {
        if ( _sourceIsVenueData ) {
            $log.debug( 'Data updated on venue model and we are using venue model' );
            _remoteData = newData;
            announceNewRemoteData()
        } else {
            $log.warn( 'Data updated on venue model and we are using DEVICE model. Ignoring.' );
        }
    }

    /**
     * Called from ogAPI directly
     * @param newData
     */
    service.deviceUpdate = function ( newData ) {
        if ( !_sourceIsVenueData ) {
            $log.debug( 'Data updated on device model and we are using device model' );
            _remoteData = newData;
            announceNewRemoteData()
        } else {
            $log.warn( 'Data updated on device model and we are using VENUE model. Ignoring.' );

        }
    }

    // TODO there should be some DB locking in here so two handsets can't step on each other....
    service.saveLocalData = function () {

        if ( _sourceIsVenueData ) {
            ogAPI.venueModel = service.localData;
        } else {
            ogAPI.model = service.localData;
        }

        return ogAPI.save( _sourceIsVenueData ? 'venue' : 'device' );
    }

    function announceNewRemoteData() {
        $rootScope.$broadcast( "DATA_CHANGED", { data: service.localData } );
    }

    return service;

} )

app.factory( 'waitList', function ( $log, $http, $timeout, $rootScope, ogAPI, $q, dataSource ) {

    $log.debug( "Loading waitlist service." );

    dataSource.localData = { parties: [] }; //init

    var service = {};

    var _deviceModel; // need a local copy for the useVenue/notUseVenue flag;


    /**
     * Factory method for generic party object. Don't use new Party()!
     * @param params
     * @returns {{name: (*|string), partySize: *, phone: (*|boolean), dateCreated: (*|Date), tableReady: (*|boolean)}}
     * @constructor
     */
    function Party( params ) {

        // Check if called with name, size
        if ( arguments.length > 1 && _.isString( arguments[ 0 ] ) ) {
            params = {
                name:      arguments[ 0 ],
                partySize: arguments[ 1 ]
            };
        }

        return {
            name:        params && params.name,
            partySize:   params && params.partySize,
            mobile:      params && params.mobile,
            dateCreated: (params && params.dateCreated) || new Date(),
            tableReady:  (params && params.tableReady) || false
        }
    }

    service.newParty = function ( params ) {
        return Party( params );
    };

    function handleUpdate( newModel ) {
        $log.debug( "Got a remote device model update" );
        dataSource.deviceUpdate( newModel.parties );
    }

    function handleVenueUpdate( newModel ) {
        $log.debug( "God a remote venue model update" );
        dataSource.venueUpdate( newModel.parties );
    }


    /**
     * Adds a party to the waiting list.  Returns promise to save data.
     * @param party
     */
    service.addParty = function ( party ) {

        var idx = _.findIndex( dataSource.localData.parties, {
            name: party.name
        } );

        if ( idx < 0 ) {
            dataSource.localData.parties.push( Party( party ) );
            return dataSource.saveLocalData();
        }

        throw new Error( "Name already on list" );
    };

    /**
     * Removes a party from the waiting list.  Returns true is success, false if that same name is not in
     * the list.
     * @param party
     */
    service.removeParty = function ( party ) {

        _.remove( dataSource.localData.parties, function ( p ) {
            return p.name === party.name;
        } );

        return dataSource.saveLocalData();

    };

    // TODO: The SMS promise is dangling...see below
    service.sitParty = function ( party ) {

        if ( party.tableReady ) {
            return service.removeParty( party );  // this does a save on its own
        } else {
            party.tableReady = new Date();
            if ( party.mobile ) {
                //We let this run open ended (no then) since if they don't get their text, oh well...
                //This is probably a bad design decision :D
                ogAPI.sendSMS( party.mobile, party.name + " your table at $$venue$$ is ready!" );
            }
            return dataSource.saveLocalData();
        }

    };

    service.loadTestData = function ( persistRemote ) {

        var testGuests = [
            service.addParty( Party( "John", 5 ) ),
            service.addParty( Party( "José", 4 ) ),
            service.addParty( Party( "Frank", 2 ) ),
            service.addParty( Party( "Jane", 3 ) ),
            service.addParty( Party( "Calvin", 5 ) ),
            service.addParty( Party( "Vivek", 4 ) ),
            service.addParty( Party( "Robin", 2 ) ),
            service.addParty( Party( "Jill", 3 ) ),
        ];

        return $q.all( testGuests );
    };

    service.getCurrentList = function () {
        return service.init.then( function(){
            return dataSource.localData;
        });
    };

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    // Assign to var so it gets done once, but we can use it repeatedly without a retrigger
    service.init = ogAPI.init( {
        appName:             "io.ourglass.waitinglist",
        appType:             'mobile',
        venueModelCallback:  handleVenueUpdate,
        deviceModelCallback: handleUpdate,
        messageCallback:     inboundMessage
        } )
        .then( function ( data ) {
            $log.debug( "waitinglist service: init success" );
            _deviceModel = data.device;
            dataSource.setSourceVenue( _deviceModel.useVenueData );
            dataSource.localData = _deviceModel.useVenueData ? data.venue : data.device;
        } );


    $log.debug( "Done initializing waitlist service." );

    service.isVenueData = function() {
        return dataSource.isSourceVenue();
    };

    service.toggleDataSource = function(){
        ogAPI.model.useVenueData = dataSource.toggleSource();
        ogAPI.save();
        return ogAPI.model.useVenueData;
    };

    return service;

} );