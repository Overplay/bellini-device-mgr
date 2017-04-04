app.factory('ogNet', function($log, $http, $q, ogAPI){

    var service = {};

    var _deviceUDID;

    function stripData(response){
        return response.data;
    }

    service.getDeviceInfo = function(){
        return $http.get( "/ogdevice/findByUDID?deviceUDID="+_deviceUDID )
            .then( stripData )
    }

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
            return $http.get( "/api/program/grid" )
                .then( function ( data ) {
                    var inbound = data.data;
                    localStorage.setItem( "grid", JSON.stringify( inbound ) );
                    localStorage.setItem( "lastGetTime", Date.now());
                    $log.debug("using new data via API call from AmstelBright");
                    return inbound;
                } )
        }
    };
    
    // TODO this is using a blueprint route, should have dedicated route for security, maybe
    service.updateSystemNameLocation = function(name){
        return service.getDeviceInfo()
            .then(function(d) {
                return $http.put( '/api/v1/ogdevice/' + d.id, { name: name } );
            });
            
    };
    
    
    service.getApps  = function() {
        
        return $http.get( "/ogdevice/appstatus?deviceUDID="+_deviceUDID )
            .then( stripData );
            
    };
    
    
    service.register = function(regcode){
        return $http.post( '/api/system/regcode?regcode=' + regcode.toUpperCase() );
    }

    function inboundMessage(msg){

    }

    function modelUpdate(data){


    }

    var initter = ogAPI.init( {
            appName:         "io.ourglass.ogcontrol",
            sockets:         true,
            modelCallback:   modelUpdate,
            messageCallback: inboundMessage,
            appType:         'mobile'
        } ).then( function(resp){
            $log.debug("Init complete");
            _deviceUDID = ogAPI.getDeviceUDID();
            return resp
        });


    service.init = function(){
        return initter
    };

    return service;

});