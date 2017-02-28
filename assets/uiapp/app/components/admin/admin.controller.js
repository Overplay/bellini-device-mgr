/**
 * Created by mkahn on 4/8/16.
 */

app.controller("adminManageUsersController", function($scope, userAuths, $state, $log){

    $log.debug("adminManageUsersController starting");
    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths; // TODO currently gets all users on the system. should group by org? 
    // who has access? 
    $log.log("All userAuths shown");

});


//not utilized 
app.controller( "adminEditUserController", function ( $scope, userAuths, $state ) {
    $log.debug("adminEditUserController starting");

    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;


} );


app.controller("adminManageDevicesController", function ($scope, $state, $log, $sce, nucleus, $http, toastr) {

    $log.debug("adminManageDevicesController starting");


    //only displays registered devices and combines the two lists
    function combineDevices(a, b) {
        return _.union(_.filter(a, {regCode: ''}), _.filter(b, {regCode: ''}));
        // return _.union(a, b);
    }

    //returns devices.owned and devices.managed TODO if admin, should return all devices
    $http.get('/user/getDevices')
        .then(function (data) {
            var devices = data.data;
            $scope.devices = combineDevices(devices.owned, devices.managed);

            //populate the devices venues since they are a level too deep under user to be prepopulated
            //async this??
            _.forEach($scope.devices, function (dev) {
                nucleus.getVenue(dev.venue)
                    .then(function (data) {
                        dev.venue = data;
                    })
            })

        })
        .catch(function (err) {
            toastr.error("Problem getting devices", "Damn! Really not good");
        });

});

app.controller('adminManageVenuesController', function ($scope, $state, $log, $sce, nucleus, $http, toastr) {
    
    $log.debug("adminManageVenuesController starting");
    
    $http.get('/user/getVenues')
        .then(function (data) {
            $scope.venues = data.data;
        })
        .catch(function (err) {
            toastr.error("Problem getting venues", "Somethin' bad happened");
        })
    
    $scope.addressify = function(address) {
        var newAddr = address.street + ' ';
        newAddr += address.city + ', ';
        newAddr += address.state + ' ';
        newAddr += address.zip;
        return newAddr;
    }
})
