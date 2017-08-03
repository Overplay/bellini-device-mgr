/**
 * Created by mkahn on 8/2/17.
 */

app.controller( 'settingsController', function ( $scope, $log, waitList ) {

    $log.debug( "Loading settings controller" );

    $scope.isVenueData = function () {
        return waitList.isVenueData();
    };

    $scope.checkIcon = function () {
        return waitList.isVenueData() ? 'glyphicon-check' : 'glyphicon-unchecked';
    };

    $scope.toggleSource = function () {
        waitList.toggleDataSource();
        //refresh();
    }

    //refresh();


} )