/**
 * Created by mkahn on 11/5/16.
 */

app.factory('waitList', function ($log, $http, $timeout, $rootScope, ogAPI, $q) {

    $log.debug("Loading waitlist service.");

    var _fetched = false;

    var service = {};

    var _deviceList = [];
    var _venueList = [];

    var usingVenueData = true;

    /**
     * Factory method for generic party object. Don't use new Party()!
     * @param params
     * @returns {{name: (*|string), partySize: *, phone: (*|boolean), dateCreated: (*|Date), tableReady: (*|boolean)}}
     * @constructor
     */
    function Party(params) {

        // Check if called with name, size
        if (arguments.length > 1 && _.isString(arguments[0])) {
            params = {
                name: arguments[0],
                partySize: arguments[1]
            };
        }

        return {
            name: params && params.name,
            partySize: params && params.partySize,
            mobile: params && params.mobile,
            dateCreated: (params && params.dateCreated) || new Date(),
            tableReady: (params && params.tableReady) || false
        }
    }

    service.newParty = function (params) {
        return Party(params);
    };

    function notify() {
        $rootScope.$broadcast('DEVICE_MODEL_CHANGED');
    }
    function notifyVenue() {
        $rootScope.$broadcast('VENUE_MODEL_CHANGED');
    }

    function handleUpdate(newModel) {
        $log.debug("Got a remote model update");
        // TODO merge with local model
        _deviceList = newModel.parties;
        notify();
    }

    function handleVenueUpdate(newModel) {
        $log.debug("God a remote venue model update");
        _venueList = newModel.parties;
        notifyVenue();
    }


    function updateRemoteModel() {
        // if (!_venueList || !_venueList.length) _venueList = [];
        // if (!_deviceList || !_deviceList.length) _deviceList = [];
        usingVenueData ? ogAPI.venueModel.parties = _venueList : ogAPI.model.parties = _deviceList
        usingVenueData ? ogAPI.saveVenueModel() : ogAPI.saveDeviceModel();
        usingVenueData ? notifyVenue() : notify();
    }

    /**
     * Adds a party to the waiting list.  Returns true is added, false if that same name is in
     * the list.
     * @param party
     */
    service.addParty = function (party) {

        var workingList = usingVenueData ? _venueList : _deviceList;

        var idx = _.findIndex(workingList, {
            name: party.name
        });

        if (idx < 0) {
            if (!workingList) workingList = [];
            workingList.push(Party(party));
            usingVenueData ? _venueList = workingList : _deviceList = workingList;
            usingVenueData ? notifyVenue() : notify();
            updateRemoteModel();
            return true; // should return false if it fails
        }

        return false;
    };

    /**
     * Removes a party from the waiting list.  Returns true is success, false if that same name is not in
     * the list.
     * @param party
     */
    service.removeParty = function (party) {
        if (usingVenueData) {
            _.remove(_venueList, function (p) {
                return p.name == party.name;
            });
        } else {
            _.remove(_deviceList, function (p) {
                return p.name == party.name;
            });
        }

        updateRemoteModel();
        return true;
    };

    service.sitParty = function (party) {

        if (party.tableReady) {
            service.removeParty(party);
        } else {
            party.tableReady = new Date();
            if (party.mobile) {
                ogAPI.sendSMS(party.mobile, party.name + " your table at $$venue$$ is ready!");
            }
        }

        updateRemoteModel();
    };

    service.loadTestData = function (persistRemote) {

        service.addParty(Party("John", 5));
        service.addParty(Party("José", 4));
        service.addParty(Party("Frank", 2));
        service.addParty(Party("Jane", 3));
        service.addParty(Party("Calvin", 5));
        service.addParty(Party("Vivek", 4));
        service.addParty(Party("Robin", 2));
        service.addParty(Party("Jill", 3));

        if (persistRemote) updateRemoteModel();

        notify();
    };

    service.getCurrentList = function () {
        return usingVenueData ? _venueList : _deviceList;
    };

    function inboundMessage(msg) {
        $log.info("New message: " + msg);
    }

    ogAPI.init({
            appName: "io.ourglass.waitinglist",
            appType: 'mobile',
            venueModelCallback: handleVenueUpdate,
            deviceModelCallback: handleUpdate,
            messageCallback: inboundMessage
        })
        .then(function (data) {
            $log.debug("waitinglist service: init success");
            _deviceList = data.parties;
        })
        .catch(function (err) {
            $log.error("waitinglist service: Something bad happened: " + err);
        });

    service.loadModel = function () {

        $log.debug("Loading model");

        if (usingVenueData) {
            if (!_venueList) {
                return ogAPI.loadModel('venue')
                    .then(function (modelData) {
                        _venueList = modelData.parties;
                        notifyVenue();
                        return _venueList;
                    });
            } else { 
                $q.when(_venueList);
            }
        }

        if (!_deviceList) {
            return ogAPI.loadModel()
                .then(function (modelData) {
                    _deviceList = modelData.parties;
                    notify();
                    return _deviceList;
                });
        } else {
            return $q.when(_deviceList);
        }

    };

    $log.debug("Done initializing waitlist service.");

    service.getUsingVenueData = function getUsingVenueData(){
        return usingVenueData;
    }

    service.swapDataLocation = function swapDataLocation() {
        usingVenueData = !usingVenueData;
        usingVenueData ? notifyVenue() : notify();
        updateRemoteModel();
        $rootScope.$broadcast("DATA_LOCATION_CHANGED")
    }

    return service;

});