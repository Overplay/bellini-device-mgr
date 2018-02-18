app.factory( 'ogNet', function ( $log, $http, $q, ogAPI, $rootScope, uibHelper ) {

    var service = {};

    var _deviceUDID;

    function stripData( response ) {
        return response.data;
    }

    service.getDeviceInfo = function () {
        return $http.get( "/ogdevice/findByUDID?deviceUDID=" + _deviceUDID )
            .then( stripData )
            .then( function ( device ) {
                device.isPairedToSTB = device.pairedTo && device.pairedTo.carrier;
                return device;
            } )
    }

    // TODO this is using a blueprint route, should have dedicated route for security, maybe
    service.updateSystemNameLocation = function ( name ) {
        return service.getDeviceInfo()
            .then( function ( d ) {
                return $http.put( '/api/v1/ogdevice/' + d.id, { name: name } );
            } );

    };

    service.changeSystemName = function ( name ) {
        return $http.post( '/ogdevice/changeName', { name: name, deviceUDID: _deviceUDID } )
            .then( stripData );
    }


    service.getApps = function () {

        return $http.get( "/ogdevice/appstatus?deviceUDID=" + _deviceUDID )
            .then( stripData );

    };


    service.register = function ( regcode ) {
        return $http.post( '/api/system/regcode?regcode=' + regcode.toUpperCase() );
    }

    function inboundAppMsg( msg ) {

    }

    function inboundSysMsg( msg ) {
        $log.debug("Inbound sys msg");
        if (msg.action === 'new-program'){
            $rootScope.$broadcast('NEW_PROGRAM', msg.program);
        }
    }

    function getBetaLink(){

        var betaUrl = '/blueline/control2/dist/index.html?deviceUDID='+ogAPI.getDeviceUDID();
        betaUrl += "&jwt=" + ogAPI.getJwt();
        return betaUrl;

    }


    function modelUpdate( data ) {


    }

    function venueModelUpdate( data ) {


    }

    var initter = ogAPI.init( {
        appName:             "io.ourglass.ogcontrol",
        deviceModelCallback: modelUpdate,
        venueModelCallback:  venueModelUpdate,
        appMsgCallback:      inboundAppMsg,
        sysMsgCallback:      inboundSysMsg,
        appType:             'mobile'
    } ).then( function ( resp ) {
        $log.debug( "Init complete" );
        if (resp.venue && resp.venue.usebeta){
            window.location.replace(getBetaLink());
        } else {
            uibHelper.confirmModal('Try Beta?', "There's a new Beta version of the control app with better search and support for favorite channels. Would you like to try it?", true)
                .then( function(){
                    ogAPI.venueModel.usebeta = true;
                    ogAPI.saveVenueModel()
                        .then( function(){
                            window.location.replace(getBetaLink());
                        })
                })
                .catch( function(){
                });
        }
        _deviceUDID = ogAPI.getDeviceUDID();
        return resp
    } );

    initter.then( function ( models ) {
        $log.debug( 'Init really complete' );
    } );

    service.init = function () {
        return initter
    };

    service.isMasqueradingAsPatron = false;

    service.toggleMasquerade = function () {
        service.isMasqueradingAsPatron = !service.isMasqueradingAsPatron;
        $rootScope.$broadcast( 'MASQUERADE_MODE_CHANGE', { isMasquerading: service.isMasqueradingAsPatron } );
        return service.isMasqueradingAsPatron;
    }

    return service;

} );