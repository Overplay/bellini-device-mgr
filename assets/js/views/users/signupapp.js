/**
 * Created by cgrigsby on 7/18/16.
 */


var app = angular.module('signupApp', ['ui.bootstrap', 'ngAnimate', 'nucleus.service', 'toastr']);


app.controller('signupController', function ($scope, $log, nucleus, $timeout, $window, toastr) {


    $scope.form = {title: 'Create New Account', show: true};
    $scope.auth = {email: "", password: "", passwordConfirm: ""};
    $scope.user = {firstName: '', lastName: '', roleNames: ['user'], address: {}};
    $scope.ui = {errorMessage: "", error: false};
    $scope.phoneRegex = "^(?:(?:\\+?1\\s*(?:[.-]\\s*)?)?(?:\\(\\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\\s*\\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\\s*(?:[.-]\\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\\s*(?:[.-]\\s*)?([0-9]{4})(?:\\s*(?:#|x\\.?|ext\\.?|extension)\\s*(\\d+))?$";
    $scope.validate = true;
    $log.log($scope.user)

    $scope.getData = function (data) { //security hole, need to check something about data for validate 
        var data = JSON.parse(data);
        _.merge($scope.auth, data.auth);
        _.merge($scope.user, data.user);

        var roles = ["user"];
        roles = _.union(roles, data.user.roleNames)
        $scope.user.roleNames = roles; 

        $scope.signupType = data.type;
        $scope.validate = false; //already facebook validated 
    }

    $scope.signup = function () {
        //$log.debug("Signup clicked for: " + $scope.auth.email + " and password: " + $scope.auth.password);


        nucleus.addUser($scope.auth.email, $scope.auth.password, $scope.user, $scope.auth.facebookId, $scope.validate)
            .then(function (data) {
                //TODO sign person in for validate = false?? 
                if ($scope.signupType == "facebook") {
                    //only happens when facebook signup 
                    $window.location.href = '/auth/login?type=facebook' //TODO figure this out if waterlock config changes hmmm, maybe have facebook auth log them in? 
                }
                else if (!$scope.validate) {
                    //redirect to log in

                    //just log them in! 
                    nucleus.authorize($scope.auth.email, $scope.auth.password)
                        .then(function (resp) {
                            $window.location.href = '/ui';
                        })
                        .catch(function (err) {
                            $log.log("Error logging in ", err)
                        })
                    
                }
                else {
                    $scope.form = {
                        title: "Validate your account before logging in by clicking the link in your email!",
                        show: false
                    };
                }

            })
            .catch(function (err) {
                $log.error("Could not create account");
                //it would be cool to have feedback, but production doesn't send data in err
                $scope.ui.errorMessage = "Account creation failed";
                $scope.ui.error = true;
                $scope.auth.email = '';
                $timeout(function () {
                    $scope.ui.error = false;
                }, 5000)
                    .then(function () {
                        $timeout(function () {
                            $scope.ui.errorMessage = "";
                        }, 1000);
                    });
            })
    }

    $scope.home = function () {
        $window.location.href = "/"
    }

    $scope.pwCheck = function () { //TODO fix this for facebook and not validate
        return ($scope.signupType === 'facebook' && $scope.auth.password == '' && $scope.auth.passwordConfirm == '')
            || ($scope.auth.password && $scope.auth.passwordConfirm &&
            $scope.auth.password.length > 7 && $scope.auth.passwordConfirm.length > 7 &&
            $scope.auth.password === $scope.auth.passwordConfirm);
    }


});
