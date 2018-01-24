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
                $scope.event.save()
                    .then( function (event) {
                        $scope.event = event; // pick up changes
                        toastr.success( "Field changed" );
                    } )
                    .catch( terror );
            } );

    }

    // $scope.selectStringField = function ( field, prompt ) {
    //
    //     var selections;
    //
    //     switch ( field ) {
    //         case 'releaseLevel':
    //             selections = sailsApps.selections.releaseLevel;
    //             break;
    //     }
    //
    //     uibHelper.selectListModal( prompt, '', selections, $scope.app[ field ] )
    //         .then( function ( idx ) {
    //             $log.debug( 'String for ' + field + ' changed to: ' + selections[ idx ] );
    //             $scope.app[ field ] = selections[ idx ];
    //             $scope.app.save()
    //                 .then( function () {
    //                     toastr.success( "Field changed" );
    //                 } )
    //                 .catch( function () {
    //                     toastr.error( "Problem changing field!" );
    //                 } );
    //         } );
    //
    //
    // }


    // $scope.boolChanged = function(){
    //     $scope.app.save()
    //         .then( function ( w ) {
    //             toastr.success( 'Field updated' )
    //         } )
    //         .catch( terror );
    // }


    // if ( app.appId === 'new.app' ) {
    //     uibHelper.stringEditModal('New App Id?', "Please enter an app id in reverse domain notation (e.g. io.ourglass.coolapp).", $scope.app.appId)
    //         .then( function(newId){
    //             // TODO validate!
    //             $scope.app.appId = newId;
    //             return $scope.app.save();
    //         })
    //         .catch( function ( err ) {
    //             $state.go( $rootScope.lastUiState.state, $rootScope.lastUiState.params );
    //         } )
    //
    // }


});