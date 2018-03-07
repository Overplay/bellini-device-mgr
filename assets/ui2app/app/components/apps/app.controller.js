/**
 * Created by mkahn on 6/23/17.
 */


app.controller( 'appListController', [ '$scope', 'apps', '$log', 'uibHelper', 'toastr',
    function ( $scope, apps, $log, uibHelper, toastr ) {

        $log.debug( 'loading appListController' );
        $scope.apps = apps;

        $scope.delete = function ( app ) {
            uibHelper.confirmModal( "Confirm", "Do you really want to delete: " + app.displayName + "?" )
                .then( function () {
                    app.delete()
                        .then( function () {
                            $scope.apps = _.without( $scope.apps, app );
                            toastr.success( "App deleted" );
                        } )
                        .catch( function ( err ) {
                            toastr.error( "Could not delete app. " + err.message );
                        } )

                } )
        }

    } ] );

app.controller( 'appEditController', function ( $scope, app, $log, uibHelper, toastr,
                                                $state, dialogService, $rootScope, sailsApps, $timeout ) {

    $log.debug( "Loading appEditController" );
    $scope.app = app;

    $scope.editors = dialogService;

    function terror( err ) {
        if ( err === 'cancel' ) {
            toastr.warning( 'Edit abandoned' );
        } else if ( err instanceof String ) {
            toastr.error( err );
        } else {
            toastr.error( err.message );
        }
    }

    function checkAppExists( appId ) {
        return sailsApps.get( appId );
    }

    $scope.changeStringField = function ( field, prompt, textArea ) {

        uibHelper.stringEditModal( prompt, "", $scope.app[ field ], field, textArea )
            .then( function ( newString ) {
                $log.debug( 'String for ' + field + ' changed to: ' + newString );
                $scope.app[ field ] = newString;
                $scope.app.save()
                    .then( function () {
                        toastr.success( "Field changed" );
                    } )
                    .catch( terror );
            } );

    }

    $scope.selectStringField = function ( field, prompt ) {

        var selections;

        switch ( field ) {
            case 'releaseLevel':
                selections = sailsApps.selections.releaseLevel;
                break;
        }

        uibHelper.selectListModal( prompt, '', selections, $scope.app[ field ] )
            .then( function ( idx ) {
                $log.debug( 'String for ' + field + ' changed to: ' + selections[ idx ] );
                $scope.app[ field ] = selections[ idx ];
                $scope.app.save()
                    .then( function () {
                        toastr.success( "Field changed" );
                    } )
                    .catch( function () {
                        toastr.error( "Problem changing field!" );
                    } );
            } );


    }


    $scope.boolChanged = function () {
        $scope.app.save()
            .then( function ( w ) {
                toastr.success( 'Field updated' )
            } )
            .catch( terror );
    }

    function returnToLastState( err ) {
        if ( err ) terror( err );
        $state.go( 'apps.list' );
    }

    $scope.refreshFromJson = function(){
        $scope.app.refreshFromInfoJson()
            .then( function(newApp){
                if (newApp.message) return terror(newApp);
                $scope.app.save();
                toastr.success('Reloaded...');
            } )
            .catch(terror);
    };


    if ( app.appId === 'new.app' ) {
        uibHelper.stringEditModal( 'New App Id?', "Please enter an app id in reverse domain notation (e.g. io.ourglass.coolapp).", app.appId )
            .then( function ( newAppId ) {
                app.appId = newAppId;
                return sailsApps.checkAppExists( newAppId );
            } )
            .then( function ( exists ) {
                if ( exists ) {
                    return { message: "An app with that ID already exists!" };
                } else {
                    toastr.success( 'Loading info.json' );
                    return sailsApps.createFromInfoJson( app.appId );
                }
            } )
            .then( function ( newApp ) {
                if ( newApp.message ) {
                    returnToLastState( newApp );
                } else {
                    $scope.app = newApp;
                    $scope.app.save();
                }
            } )
            .catch( returnToLastState )

    }


} );