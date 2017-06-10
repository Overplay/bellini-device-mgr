/**
 * Created by mkahn on 11/5/16.
 */

app.factory( 'waitList', function ( $log, $http, $timeout, $rootScope, ogAPI, $q ) {

    $log.debug( "Loading waitlist service." );
    
    var _fetched = false;

    var service = {};

    var _currentList;

    /**
     * Factory method for generic party object. Don't use new Party()!
     * @param params
     * @returns {{name: (*|string), partySize: *, phone: (*|boolean), dateCreated: (*|Date), tableReady: (*|boolean)}}
     * @constructor
     */
    function Party(params){

        // Check if called with name, size
        if (arguments.length > 1 && _.isString(arguments[0])){
            params = { name: arguments[0], partySize: arguments[1] };
        }

        return {
            name: params && params.name,
            partySize: params && params.partySize,
            mobile: params && params.mobile,
            dateCreated: ( params && params.dateCreated ) || new Date(),
            tableReady : ( params && params.tableReady ) || false
        }
    }

    service.newParty = function(params){
        return Party(params);
    };

    function notify() {
        $rootScope.$broadcast( 'MODEL_CHANGED' );
    }

    function handleUpdate( newModel ) {
        $log.debug( "Got a remote model update" );
        // TODO merge with local model
        _currentList = newModel.parties;
        notify();
    }


    function updateRemoteModel() {
        ogAPI.model.parties = _currentList;
        ogAPI.save();
        notify();
    }

    /**
     * Adds a party to the waiting list.  Returns true is added, false if that same name is in
     * the list.
     * @param party
     */
     service.addParty = function( party ) {

         var idx = _.findIndex(_currentList, { name: party.name });

         if ( idx < 0 ) {
             _currentList.push( Party( party ) );
             updateRemoteModel();
             return true;  // should return false if it fails
         }

        return false;
    };

    /**
     * Removes a party from the waiting list.  Returns true is success, false if that same name is not in
     * the list.
     * @param party
     */
     service.removeParty = function( party ) {

         _.remove( _currentList, function(p){
            return p.name == party.name;
        });

        updateRemoteModel();
        return true;
    };

    service.sitParty = function( party ) {

        if ( party.tableReady ){
            service.removeParty( party );
        } else {
            party.tableReady = new Date();
            if (party.mobile) {
                ogAPI.sendSMS( party.mobile, party.name + " your table at $$venue$$ is ready!");
            }
        }

        updateRemoteModel();
    };

    service.loadTestData = function( persistRemote ) {

        service.addParty( Party("John", 5) );
        service.addParty( Party("José", 4 ) );
        service.addParty( Party("Frank", 2 ));
        service.addParty( Party("Jane", 3 ) );
        service.addParty( Party( "Calvin", 5 ) );
        service.addParty( Party( "Vivek", 4 ) );
        service.addParty( Party( "Robin", 2 ) );
        service.addParty( Party( "Jill", 3 ) );

        if ( persistRemote ) updateRemoteModel();

        notify();
    };

    service.getCurrentList = function (){
        return _currentList;
    };

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }

    ogAPI.init( {
        appName: "io.ourglass.waitinglist",
        appType: 'mobile',
        modelCallback: handleUpdate,
        messageCallback: inboundMessage
    })
        .then( function ( data ) {
            $log.debug("waitinglist service: init success");
            _currentList = data.parties;
        })
        .catch( function ( err ) {
            $log.error("waitinglist service: Something bad happened: " + err);
        });

    service.loadModel = function(){

        $log.debug("Loading model");

        if (!_currentList){
            return ogAPI.loadModel()
                .then( function ( modelData ) {
                    _currentList = modelData.parties;
                    notify();
                    return _currentList;
                } );
        } else {
            return $q.when(_currentList);
        }

    };
    
    $log.debug("Done initializing waitlist service.");

    return service;

} );