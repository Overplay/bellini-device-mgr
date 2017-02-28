/**
 * Created by mkahn on 4/5/16.
 */

var app = angular.module('loginApp', ['ui.bootstrap', 'ngAnimate', 'nucleus.service']);

app.controller("loginController", function ($scope, $log, $http, $window, $timeout, nucleus) {


    $scope.user = {email: "", password: ""}
    $scope.ui = {errorMessage: "", error: false}

    $scope.login = function () {

        //$log.debug("Login clicked for: " + $scope.user.email + " and password: " + $scope.user.password);
        nucleus.authorize($scope.user.email, $scope.user.password)
            .then(function (res) {
                $log.info("Logged in");
                $window.location.href = '/ui';
            })
            .catch(function (err) {
                $log.error("Could not log in");
                $scope.ui.errorMessage = "Invalid login";
                $scope.ui.error = true;
                $timeout(function () {
                    $scope.ui.error = false;
                }, 5000)
                    .then(function () {
                        $timeout(function () {
                            $scope.ui.errorMessage = "";
                        }, 1000);
                    });
            });

    }

    $scope.forgot = function () {

        if (!$scope.user.email) {
            $scope.ui.errorMessage = "Please enter your email";
            $scope.ui.error = true;
            $timeout(function () {
                $scope.ui.error = false;
            }, 5000)
                .then(function () {
                    $timeout(function () {
                        $scope.ui.errorMessage = "";
                    }, 1000);
                });
            ;
        } else {
            nucleus.reqNewPwd($scope.user.email)
                .then(function () {
                    $scope.ui.errorMessage = "Check your email for a reset link!";
                    $scope.ui.error = true;

                    $timeout(function () {
                        $scope.ui.error = false;

                    }, 5000)
                        .then(function () {
                            $timeout(function () {
                                $scope.ui.errorMessage = "";
                                window.location.href = '/';
                            }, 1000);
                        });
                })
                .catch(function () {
                    $scope.ui.errorMessage = "There was a problem resetting your password.";
                    $scope.ui.error = true;

                    $timeout(function () {
                        $scope.ui.error = false;
                        $scope.ui.errorMessage = "";
                    }, 5000)
                        .then(function () {
                            $timeout(function () {
                                $scope.ui.errorMessage = "";
                            }, 1000);
                        });
                    
                })
        }


    }
});