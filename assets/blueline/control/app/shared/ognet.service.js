app.factory('ogNet', function($log, $http, $q, ogAPI, $rootScope){

    var service = {};

    var _deviceUDID;

    function stripData(response){
        return response.data;
    }

    service.getDeviceInfo = function(){
        return $http.get( "/ogdevice/findByUDID?deviceUDID="+_deviceUDID )
            .then( stripData )
            .then( function(device){
                device.isPairedToSTB = device.pairedTo && device.pairedTo.carrier;
                return device;
            })
    }
    
    // TODO this is using a blueprint route, should have dedicated route for security, maybe
    service.updateSystemNameLocation = function(name){
        return service.getDeviceInfo()
            .then(function(d) {
                return $http.put( '/api/v1/ogdevice/' + d.id, { name: name } );
            });

    };

    service.changeSystemName = function(name){
        return $http.post('/ogdevice/changeName', { name: name, deviceUDID: _deviceUDID })
            .then(stripData);
    }
    
    
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
            modelCallback:   modelUpdate,
            messageCallback: inboundMessage,
            appType:         'mobile'
        } ).then( function(resp){
            $log.debug("Init complete");
            _deviceUDID = ogAPI.getDeviceUDID();
            return resp
        });

    initter.then( function(models){
        $log.debug('Init really complete');
    });

    service.init = function(){
        return initter
    };

    service.isMasqueradingAsPatron = false;

    service.toggleMasquerade = function(){
        service.isMasqueradingAsPatron = !service.isMasqueradingAsPatron;
        $rootScope.$broadcast('MASQUERADE_MODE_CHANGE', { isMasquerading: service.isMasqueradingAsPatron });
        return service.isMasqueradingAsPatron;
    }

    return service;

});