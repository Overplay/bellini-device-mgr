/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceUserController", function ($scope, $state, $log, toastr, nucleus, $http, links, user) {

    $log.debug("addDeviceUserController");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.user = user;

    if (!$scope.user.ownedVenues.length) {
        toastr.warning("You must add a venue before adding a device", "No Owned Venues");
        $state.go('venue.userAdd');
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
            + venue.address.street + ' '
            + venue.address.city + ', '
            + venue.address.state + ')';
    }


});

app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http, user, uibHelper, links) {

    $log.debug("addDeviceController starting.");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.device = {};
    $scope.code = false;

    $http.get("api/v1/user/" + user.id) //nucleus.getMe doesn't populate ownedVenues (probably because of waterlock)
        .then(function(u){
            $scope.user = u.data;
        })
        .then( function () {
            if (!$scope.user.ownedVenues.length) {
                toastr.warning("You must add a venue before adding a device", "No Owned Venues");
                $state.go('venue.userAdd');
            }
        })
        .catch( function (err) {
            $log.debug("Error fetching owned venues")
        });


    $scope.testDevice = function () {
        //create a device for testing purposes! 
        $http.post('/device/testDevice', $scope.device)
            .then(function (data) {
                toastr.success("test device: " + data.data.name + " created successfully", "Yay!")
                $state.go("device.list")
            })
            .catch(function (err) {
                toastr.error("Test Device not created: " + err, "Damn!");
            });
    };

    $scope.submitForCode = function () {
        $http.post('/activation/generateCode', $scope.device)
            .then(function (data) {
                $scope.code = true;
                $scope.data = data.data;
            })
            .catch(function (err) {
                toastr.error("Device activation code not generated", "Damn!");
            });
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
            + venue.address.street + ' '
            + venue.address.city + ', '
            + venue.address.state + ')';
    }

});


app.controller("addDeviceAdminController", function ($scope, $state, $log, toastr, nucleus, $http, venues, uibHelper, links) {

    $log.debug("addDeviceController starting.");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.device = {};
    $scope.code = false;
    $scope.venues = venues;

    $scope.testDevice = function () {
        //create a device for testing purposes!
        $http.post('/device/testDevice', $scope.device)
            .then(function (data) {
                toastr.success("test device: " + data.data.name + " created successfully", "Yay!")
                //TODO redirect
                $state.go("device.adminList")
            })
            .catch(function (err) {
                toastr.error("Test Device not created: " + err, "Damn!");
            });
    };

    $scope.submitForCode = function () {
        $http.post('/activation/generateCode', $scope.device)
            .then(function (data) {
                $scope.code = true;
                $scope.data = data.data;
            })
            .catch(function (err) {
                toastr.error("Device activation code not generated", "Damn!");
            });
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
            + venue.address.street + ' '
            + venue.address.city + ', '
            + venue.address.state + ')';
    }

});

app.controller("editDeviceAdminController", function ($scope, $state, $log, device, toastr, uibHelper, nucleus, venues, $http, links, edit) {
    $log.debug("editDeviceAdminController starting");


    $scope.edit = edit;
    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.$parent.ui.pageTitle = "Manage Device";
    $scope.$parent.ui.panelHeading = device.name || "Device";
    $scope.$parent.links = links;
    $scope.venues = venues;
    $scope.setForm = function (form) {
        $scope.form = form;
    };

    $scope.heartbeat = {
        logs: [],
        selected: null,
        loading: true,
        message: "No Heartbeats Found"
    };

    if (device.uniqueId) {
        $http.get('OGLog/deviceHeartbeat/' + device.uniqueId)
            .then( function (res) {
                $scope.heartbeat.logs = res.data;
                $scope.heartbeat.selected = res.data[0];
            })
            .catch( function (err) {
                $log.error(err);
                $scope.heartbeat.message = "Error getting heartbeats";
            })
            .then( function () {
                $scope.heartbeat.loading = false;
            });
    }
    else
        $scope.heartbeat.loading = false;

    $scope.update = function () {
        //post to an update with $scope.device
        //TODO refactor this
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then(function (d) {
                toastr.success("Device info updated", "Success!");
                $scope.$parent.ui.panelHeading = d.name;
                // $state.go('admin.manageDevices')
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    }


    // Cole's code for deleting device
    //TODO test
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel

                    //$log.log("ugh")
                    //TODO 
                    $http.delete("api/v1/device/" + $scope.device.id) //todo make sure malicious user doesn't change device id in scope and click delete
                        .then(function () {
                            //$log.log("wut")
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('device.adminList');
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })

                }
                else
                    $log.log("WOWWWW")
            })
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
            + venue.address.street + ' '
            + venue.address.city + ', '
            + venue.address.state + ')';
    }

    $scope.addressString = function (address) {
        return address.street + ' '
            + address.city + ', '
            + address.state + ' '
            + address.zip;
    }

});

app.controller("editDeviceOwnerController", function ($rootScope, $scope, $state, $log, device, toastr, uibHelper, nucleus, user, $http, links, edit) {
    $log.debug("editDeviceOwnerController starting");

    $scope.edit = edit;
    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.$parent.ui.pageTitle = "Manage Device";
    $scope.$parent.ui.panelHeading = device.name || "Device";
    $scope.$parent.links = links;
    $scope.confirm = {checked: false};
    $scope.setForm = function (form) {
        $scope.form = form;
    };

    $scope.heartbeat = {
        logs: [],
        selected: null,
        loading: true,
        message: "No Heartbeats Found"
    };

    if (device.uniqueId) {
        $http.get('OGLog/deviceHeartbeat/' + device.uniqueId)
            .then( function (res) {
                $scope.heartbeat.logs = res.data;
                $scope.heartbeat.selected = res.data[0];
            })
            .catch( function (err) {
                $log.error(err);
                $scope.heartbeat.message = "Error getting heartbeats";
            })
            .then( function () {
                $scope.heartbeat.loading = false;
            });
    }
    else
        $scope.heartbeat.loading = false;

    $http.get("api/v1/user/" + user.id) //nucleus.getMe doesn't populate ownedVenues (nucleus uses and auth endpoint in getMe)
        .then(function(u){
            $scope.user = u.data;
        })
        .catch( function (err) {
            $log.debug("Error fetching user")
        });

    $scope.addLineup = function () {
        $http.get('api/v1/venue/' + device.venue.id)
            .then( function (res) {
                var lineups = []
//                return _.map(res.data.devices, function (o) { return o.lineupID ? { ID: o.lineupID, name: o.lineupName} : null})
                _.forEach(res.data.devices, function (o) { if (o.lineupID) lineups.push({lineupID: o.lineupID, lineupName: o.lineupName, source: "venue"})});
                return lineups;
            })
            .then( function (lineups) {
                if (!lineups) {
                    return $http.get('http://'+url+':1338/lineup/searchByZip', { params: { zip : device.venue.address.zip, extended: true }})
                        .then( function (res) {
                            return _.map(res.data, function (o) {
                                o["source"] = "remote";
                                return o;
                            })
                        })
                }
                lineups.push({ lineupName: "Search for more lineups..." });
                return lineups;
            })
            .then( function (lineups) {
                return uibHelper.selectListModal("Select your program lineup from the list below:", "", _.map(lineups, "lineupName"), 0)
                    .then( function (res) {
                        return lineups[res];
                    })
            })
            .then( function (res) {
                if (res.lineupName === "Search for more lineups...") {
                    $log.debug("SEARCH HERE");
                    return $http.get('http://' + url + ':1338/lineup/searchByZip', { params: { zip: device.venue.address.zip, extended: true}})
                        .then(function (res) {
                            return _.map(res.data, function (o) {
                                o["source"] = "remote";
                                return o;
                            })
                        })
                        .then(function (lineups) {
                            return uibHelper.selectListModal("Select your program lineup from the list below:", "", _.map(lineups, "lineupName"), 0)
                                .then(function (res) {
                                    return lineups[res];
                                })
                        })
                }
                else
                    return res;
            })
            .then(function (res) {
                if (res.source === "remote") {
                    delete res.source;
                    res.zip = device.venue.address.zip;
                    return $http.post('http://'+url+':1338/lineup/add', res )
                        .then( function (data) {
                            return data.data;
                        })
                }
                else {
                    return res;
                }
            })
            .then( function (res) {
                $scope.device.lineupID = res.id;
                $scope.device.lineupName = res.lineupName;
                nucleus.updateDevice($scope.device.id, $scope.device)
                    .then( function () {
                        toastr.success("Lineup successfully added", "Success!");
                    })
                    .catch( function () {
                        toastr.error("Could not update device", "Error!");
                    })
            })
    }

    $scope.removeLineup = function () {
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then( function (d) {

            })
    }

    $scope.update = function () {
        //post to an update with $scope.device
        //TODO refactor this
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then(function (d) {
                toastr.success("Device info updated", "Success!");
                $scope.$parent.ui.panelHeading = d.name;
                // $state.go('admin.manageDevices')
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    }



    // Cole's code for deleting device
    //TODO test only allow owner 
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel

                    //$log.log("ugh")
                    //TODO
                    $http.delete("api/v1/device/" + $scope.device.id) //todo make sure malicious user doesn't change device id in scope and click delete
                        .then(function () {
                            //$log.log("wut")
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('device.list')
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })

                }
                else
                    $log.log("WOWWWW")
            })
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
            + venue.address.street + ' '
            + venue.address.city + ', '
            + venue.address.state + ')';
    }

    $scope.addressString = function (address) {
        return address.street + ' '
            + address.city + ', '
            + address.state + ' '
            + address.zip;
    }

});

app.controller('listDeviceController', function ($scope, devices, $log, uibHelper, $http, role, links) {

    $log.debug("loading listDeviceController");
    $scope.$parent.ui.pageTitle = "Device List";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.admin = role === "admin";
    $scope.devices = devices;

    if (role === "admin")
        $scope.edit = 'device.adminManage({ id: device.id })';
    else if (role === "manager")
        $scope.edit = 'device.managerManage({ id: device.id })';
    else
        $scope.edit = 'device.ownerManage({ id: device.id })';

    if (role !== "admin") { //TODO test
        _.forEach($scope.devices, function (dev) {
            $http.get("api/v1/venue/" + dev.venue)
                .then(function (data) {
                    delete data.data.devices;
                    dev.venue = data.data;
                })
                .catch(function (err) {
                    $log.debug(err);
                })
        })
    }

})