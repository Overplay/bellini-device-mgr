app.factory('ogNet', function($log, $http, $q, ogAPI){

    var service = {};

    var _deviceUDID = ogAPI.getDeviceUDID();

    function stripData(response){
        return response.data;
    }

    // TODO this will need to work with BlueLine
    service.getDeviceInfo = function() {
        return $http.get("/appmodel/control/" + ogAPI.getDeviceUDID())
            .then( stripData )
    };

    //The caching is probably no longer needed since AB does the caching too...and it's better at it.
    service.getGrid = function() {

        // Grab local copy, if one exists
        var grid = localStorage.getItem( "grid" );

        var now = Date.now();
        var lastGetTime = parseInt(localStorage.getItem("lastGetTime"), 10);
        var useCached = false;

        if (lastGetTime && now < lastGetTime + 300000) {
            useCached = true;
        }
        
        if ( grid && useCached ) {
            // We had a local copy, so make it JSON and return as an already resolved promise
            $log.debug("using cached grid data");
            return $q.when( JSON.parse( grid ) );
        } else {
            // no local copy or caching is turned off, let's get fresh data
            return $http.get( "/bellini/getprogramguide" ) // updated for BlueLine
                .then( function ( data ) {
                    var inbound = data.data;
                    localStorage.setItem( "grid", JSON.stringify( inbound ) );
                    localStorage.setItem( "lastGetTime", Date.now());
                    $log.debug("using new data via API call from AmstelBright");
                    return inbound;
                })
        }
    };
    
    // TODO this is using a blueprint route, should have dedicated route for security, maybe
    service.updateSystemNameLocation = function(name){
        return service.getDeviceInfo()
            .then(function(d) {
                return $http.put( '/api/v1/ogdevice/' + d.id, { name: name } );
            });
    };
    
    // TODO: this needs to be more robust, checking if the model has apps
    service.getApps  = function() {
        return ogAPI.loadModel()
            .then( function ( data ) {
                $log.debug("got model data");
                return data.apps
            })
        // return $http.get( "/ogdevice/appstatus?deviceUDID=" + _deviceUDID )
        //     .then( stripData );
    };
    
    
    service.register = function(regcode){
        return $http.post( '/api/system/regcode?regcode=' + regcode.toUpperCase() );
    };

    function modelChanged( newData ) {
        $log.debug("ogNet: got a model change");
    }

    function inboundMessage( msg ) {
        $log.info( "New message: " + msg );
    }
    
    function initialize() {
        ogAPI.init({
            appName: "control",
            sockets: true,
            modelCallback: modelChanged,
            messageCallback: inboundMessage,
            appType: 'mobile',
            deviceUDID: "test"
        })
            .then ( function ( data ) {
                $log.debug("ogNet service successful init");
            })
            .catch( function ( err ) {
                $log.error("Something failed: " + err);
            })
    }

    initialize();

    return service;
    
});
