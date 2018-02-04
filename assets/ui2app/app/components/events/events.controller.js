/**
 * Created by mkahn on 6/23/17.
 */


app.controller( 'eventListController', [ '$scope', 'events', '$log', 'uibHelper', 'toastr',
    function ( $scope, events, $log, uibHelper, toastr  ) {

    $log.debug( 'loading eventListController' );
    $scope.events = events;

    $scope.delete = function(event){
        uibHelper.confirmModal("Confirm", "Do you really want to delete: "+ event.name+"?")
            .then(function(){
                event.delete()
                    .then( function(){
                        $scope.events = _.without( $scope.events, event );
                        toastr.success("Event deleted");
                    })
                    .catch( function(err){
                        toastr.error("Could not delete event. "+err.message);
                    })

            })
    }

} ]);

app.controller( 'eventEditController', function ( $scope, event, $log, uibHelper, toastr,
                                                 $state, dialogService ) {

    $log.debug( "Loading eventEditController" );
    $scope.event = event;

    $scope.editors = dialogService;

    function terror( err ) {
        if (err==='cancel'){
            toastr.warning( 'Edit abandoned');
        } else {
            toastr.error( err.message );

        }
    }

    $scope.changeStringField = function ( field, prompt, textArea ) {

        uibHelper.stringEditModal( prompt, "", $scope.event[ field ], field, textArea )
            .then( function ( newString ) {
                $log.debug( 'String for ' + field + ' changed to: ' + newString );
                $scope.event[ field ] = newString;
                toastr.success("Don't forget to click SAVE!");
            } );

    }

    $scope.changeDate = function(){

        uibHelper.dateModal("Set Date", "", $scope.event.date)
            .then( function(newDate){
                $log.debug("New Date chosen..."+newDate);
                $scope.event.date = newDate;
                toastr.success( "Don't forget to click SAVE!" );

            } )
            .catch( terror );

    }

    $scope.save = function(){
        if ($scope.event.data.forceReset){
            $scope.event.data.quarter = 0;
            $scope.event.data.team1.score = 0;
            $scope.event.data.team2.score = 0;
        }

        $scope.event.save()
            .then( function ( event ) {
                $scope.event = event; // pick up changes
                toastr.success( "Event saved" );
            } )
            .catch( terror );

    }


});