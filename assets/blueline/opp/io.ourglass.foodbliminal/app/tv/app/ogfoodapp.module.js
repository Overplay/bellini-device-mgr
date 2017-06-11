/*********************************

 File:       optvDailySpecialsApp.module
 Function:   Daily Specials / Pubcrawler App
 Copyright:  Ourglass
 Date:       June 2016
 Author:     mkahn

 **********************************/


var app = angular.module('ogFoodApp', ['ourglassAPI']);


app.controller("popUpController", function($scope, $log, $interval, $timeout){

    var popups = [
        { img: 'burger.png', text: ''},
        { img: 'nachos.png', text: '' },
        { img: 'ogbrooklyn.png', text: '' },
        { img: 'ogsierra.png', text: '' },
        { img: 'sierranevada.png', text: ''},
        { img: 'wings.png', text: ''}

    ];

    var idx = 0;
    $scope.popup = {
        pic: popups[idx],
        hide: true,
        right: true
    };


    $interval( function(){
        $log.debug( "Showing " + $scope.popup.pic.img );
        $scope.popup.hide = false;
        $timeout(function(){
            $log.debug("Hiding "+$scope.popup.pic.img);
            $scope.popup.hide = true;
        }, 5000);
        $timeout(function(){
            $log.debug( "Moving, changing " + $scope.popup.pic.img );
            $scope.popup.right = !$scope.popup.right;
            idx = (idx+1) % popups.length;
            $scope.popup.pic = popups[idx];
        }, 6000);
    }, 10000);

});

app.directive("popUp", function ( $log, $timeout, $window, $interval, $rootScope ) {

    return {
        restrict:    'E',
        scope:       {
            popup: '='
        },
        templateUrl: 'app/popup.template.html',
        link:        function ( scope, elem, attrs ) {


        }
    }

});