/**
 * Created by rhartzell on 5/24/16.
 */

addressify = function (address) {
    return address.street + ' '
        + address.city + ', '
        + address.state + ' '
        + address.zip
};

app.controller("addEditVenueController", function ($scope, $log, nucleus, $state, $http, $q, toastr, uibHelper, venue, edit, uiGmapGoogleMapApi, links, $window, role, $rootScope) {

    $log.debug("addEditVenueController starting");
    $scope.$parent.ui.pageTitle = edit ? "Edit Venue" : "Add New Venue";
    $scope.$parent.ui.panelHeading = venue ? venue.name : "";
    $scope.$parent.links = links;

    $scope.edit = edit;
    $scope.yelp = {};
    $scope.venue = venue || {showInMobileAppMap: true, address: {}, photos: []};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.confirm = { checked: false };
    $scope.admin = role === "admin";
    $scope.setForm = function (form) { $scope.form = form; };
    uiGmapGoogleMapApi.then( function (maps) { $scope.maps = maps; });


    $scope.geolocation = "";

    $scope.media = {
        logo: null,
        photos: [null, null, null]
    };

    $scope.parameters = {
        term: "",
        location: "",
        limit: 8
    };
    $scope.results = {};

    // initialize location to prepopulate location field
    $scope.initializeLocation = function () {
        if (!edit) {
            if ($scope.geolocation)
                $scope.parameters.location = $scope.geolocation;
            else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var latLong = position.coords.latitude.toString() + "," + position.coords.longitude.toString();
                    $http.get('venue/yelpSearch', {params: {term: "food", ll: latLong, limit: 1}, timeout: 2000})
                        .then(function (data) {
                            var loc = data.data.businesses[0].location;
                            $scope.geolocation = $scope.parameters.location = loc.city + ", " + loc.state_code;
                        })
                        .catch(function (err) {
                            toastr.error("Try again later", "Location Unavailable");
                        })
                })
            }
            else {
                toastr.error("Your browser doesn't support geolocation", "Location Unavailable");
            }
        }
    };


    $scope.submit = function () {
        var promise;

        if ($scope.media.logo) {
            promise = nucleus.uploadMedia($scope.media.logo)
                .then(function (data) {
                    $scope.venue.logo = data.id;
                })
        }
        else {
            promise = $q(function (resolve, reject) {
                resolve();
            });
        }
        $scope.media.photos.forEach(function (img, index) {
            if (img) {
                promise = promise.then(function () {
                    return nucleus.uploadMedia(img)
                        .then(function (data) {
                            $scope.venue.photos[index] = data.id;
                        })
                })
            }
        })

        if ($scope.edit) {
            promise = promise.then(function () {
                nucleus.updateVenue($scope.venue.id, $scope.venue)
                    .then(function (v) {
                        toastr.success("Venue info updated", "Success!");
                        $state.go('venue.view', {id: v.id});
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Damn!");
                    });
            })
        }
        else {
            promise = promise.then(function () {
                nucleus.addVenue($scope.venue)
                    .then(function (res) {
                        toastr.success("Venue created", "Success!")
                        if (role === "user") {
                            $rootScope.$emit('navBarUpdate', res.user.roleTypes);
                            $state.go('device.userAdd');
                        }
                        else if ($scope.admin)
                            $state.go('venue.adminView', {id: res.venue.id});
                        else
                            $state.go('venue.view', {id: res.venue.id});
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Error")
                    })
            })
        }

    };

    $scope.getResults = function () {
        if ($scope.parameters.location) {
            return $http.get('/venue/yelpSearch', {params: $scope.parameters, timeout: 2000})
                .then(function (data) {
                    return data.data.businesses;
                })
        }

        return null;

    };

    $scope.selected = function ($item, $model) {
        $scope.venue.name = $model.name;
        $scope.venue.address = {
            street: $model.location.address[0],
            street2: $model.location.address[1],
            city: $model.location.city,
            state: $model.location.state_code,
            zip: $model.location.postal_code
        };
        $scope.venue.geolocation = {
            latitude: $model.location.coordinate.latitude,
            longitude: $model.location.coordinate.longitude
        };
        $scope.venue.yelpId = $model.id;
    };

    $scope.deleteVenue = function () {

        uibHelper.confirmModal("Delete Venue?", "Are you sure you want to delete " + $scope.venue.name + "?", true)
            .then(function (confirmed) {
                if (confirmed) {
                    nucleus.deleteVenue($scope.venue.id)
                        .then(function () {
                            toastr.success("It's gone!", "Venue Deleted");
                            if ($scope.admin)
                                $state.go('venue.adminList');
                            else
                                $state.go('venue.list');
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Venue");
                        })
                }
            })
    }
})

app.controller('listVenueController', function ($scope, venues, $log, links, role) {

    $log.debug("loading listVenueController");
    $scope.$parent.ui.pageTitle = "Venue List";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.venues = venues;
    $scope.admin = role === "admin";

})

app.controller('viewVenueController', function ($scope, venue, $log, uiGmapGoogleMapApi, uibHelper, nucleus, user, $http, toastr, links, role, $uibModal) {
    
    $scope.venue = venue;
    $scope.$parent.ui.pageTitle = "Venue Overview";
    $scope.$parent.ui.panelHeading = venue.name;
    $scope.$parent.links = links;

    $scope.admin = role === "admin";
    $scope.uid = user.id;
    $scope.mediaSizes = ['widget', 'crawler'];

    $scope.sponsorships = [];
    //$log.log($scope.uid)

    $http.get('/ad/forVenue/' + venue.id)
        .then( function (res) {
            $scope.sponsorships = res.data;
        })

    $scope.userRoute = function (id) {
        if (id === user.id)
            return "user.editUser()";
        else if ($scope.admin)
            return "user.editUserAdmin({id: user.auth})";
        return "user.editUserOwner({id: user.auth})";
    }

    $scope.map = {
        center: {
            latitude: 37.2871407,
            longitude: -121.9430289
        },
        marker: {
            latitude: 37.2871407,
            longitude: -121.9430289
        },
        zoom: 18,
        address: addressify(venue.address),
        markerId: 0
    };

    uiGmapGoogleMapApi.then(function (maps) {
        $scope.maps = maps;

        if (venue.geolocation && venue.geolocation.latitude && venue.geolocation.longitude) {
            $scope.map.marker.latitude = $scope.map.center.latitude = venue.geolocation.latitude;
            $scope.map.marker.longitude = $scope.map.center.longitude = venue.geolocation.longitude;
        }
        else {
            var geocode = new maps.Geocoder();
            geocode.geocode({
                address: $scope.map.address
            }, function (res, stat) {
                $scope.venue.geolocation = {
                    latitude: $scope.map.center.latitude = res[0].geometry.location.lat(),
                    longitude: $scope.map.center.longitude = res[0].geometry.location.lng()
                };
                nucleus.updateVenue($scope.venue.id, $scope.venue)
                    .then(function () {
                    })
            })
        }
    })

    $scope.proprietor = {email: ''}

    $scope.form = {}


    $scope.addProprietor = function (type) {

        //query if the email exists as a user, then
        //either confirm, or ask to invite if not found


        $http.post("/user/findByEmail", {email: $scope.proprietor.email})
            .then(function (response) {
                //$log.log(response)
                if (response.data.error) {
                    //not found
                    uibHelper.confirmModal("Invite to Ourglass?", "We couldn't find a user with the email: " + $scope.proprietor.email + "\n Would you like us to send them an email invite to Ourglass?", true)
                        .then(function (confirmed) {

                            //Goals: send email, click link, sign up and already have the roles and venue
                            $http.post("/user/inviteUser", {
                                    email: $scope.proprietor.email,
                                    name: user.firstName + " " + user.lastName,
                                    role: type,
                                    venue: $scope.venue
                                })
                                .then(function () {
                                    var email = $scope.proprietor.email
                                    toastr.success("Email invite sent to " + email, "Nice! ")
                                    $scope.proprietor.email = ''

                                })
                        })

                }
                //maybe check existing roles and take two different routes in the future
                else {
                    //found
                    uibHelper.confirmModal("User found!", "Are you sure you would like to add them to " + $scope.venue.name + " as a" + (type == "owner" ? "n " : " ") + type + "?", true)
                        .then(function (confirmed) {

                            $http.post("/user/inviteRole", {
                                    email: $scope.proprietor.email,
                                    name: user.firstName + " " + user.lastName,
                                    role: type,
                                    venue: $scope.venue
                                })
                                .then(function () {
                                    var email = $scope.proprietor.email
                                    toastr.success("Email invite sent to " + email, "Nice! ")
                                    $scope.proprietor.email = ''

                                })
                            //IDEA: notification to inviter when/if its accepted??
                        })
                }
            })
    }

    $scope.removeManager = function (user) {
        var venueId = $scope.venue.id;

        uibHelper.confirmModal("Remove Manager?", "Are you sure you want to remove " + user.firstName + " " + user.lastName + " as a manager of " + $scope.venue.name + "?", true)
            .then(function (confirmed) {
                $http.post('/venue/removeManager', {

                        userId: user.id,
                        id: venueId
                        
                    })
                    .then(function (response) {
                        $scope.venue.venueManagers = response.data
                        toastr.success("Removed manager", "Nice!")

                        $scope.input = ''
                    })
            })
    }

    $scope.removeOwner = function (userId) {
        var venueId = $scope.venue.id;

        uibHelper.confirmModal("Remove Owner?", "Are you sure you want to remove this owner?", true)
            .then(function (confirmed) {
                $http.post('/venue/removeOwner', {

                        userId: userId,
                        id: venueId
                        
                    })
                    .then(function (response) {
                        $log.log(response)
                        $scope.venue.venueOwners = response.data
                        toastr.success("Removed owner", "Nice!")

                        $scope.input = ''
                    })
            });

    }

    $scope.addSponsorship = function () {
        $uibModal.open({
            templateUrl: '/uiapp/app/shared/uibHelperService/adlistmodal.template.html',
            controller: function ($scope, sponsorships, $uibModalInstance) {
                $scope.modalUi = {
                    sponsorships: sponsorships,
                    mediaSizes: ['widget', 'crawler']
                }

                $scope.ok = function (sponsorship) {
                    $uibModalInstance.close(sponsorship);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                }
            },
            resolve: {
                sponsorships: function ($http) {
                    return $http.get('api/v1/ad')
                        .then( function (res) {
                            return _.differenceBy(res.data, $scope.venue.sponsorships, function (o) { return o.id || o })
                        });
                }
            },
            size: 'lg'
        })
            .result.then( function (s) {
                if (!s)
                    return null;

                try {
                    $scope.venue.sponsorships.push(s.id);
                }
                catch (e) {
                    $scope.venue.sponsorships = [s.id];
                }
                $http.post('api/v1/venue/' + $scope.venue.id, $scope.venue)
                    .then( function (res) {
                        $scope.sponsorships.push(s);
                        toastr.success('Sponsorship added!', 'Success')
                    })
                    .catch( function (err) {
                        toastr.error('Could not update the venue at this time', 'Error');
                    })
            })
    }

    $scope.removeSponsorship = function (id) {
        uibHelper.confirmModal('Remove sponsorship?', 'Are you sure you want to remove this sponsorship from appearing in ' + venue.name + '?', true)
            .then( function () {
                $scope.venue.sponsorships.splice($scope.venue.sponsorships.indexOf(id), 1);
                $http.post('api/v1/venue/' + $scope.venue.id, $scope.venue)
                    .then( function (res) {
                        $scope.sponsorships = _.filter($scope.sponsorships, function (o) { return o.id !== id });
                        toastr.success('Sponsorship removed', "Success")
                    })
                    .catch( function (err) {
                        $log.error(err);
                        $scope.venue.sponsorships.push(id);
                        toastr.error('Sponsorship could not be removed', "Error")
                    })
            })
    }


})

