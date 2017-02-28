/**
 * Created by mkahn on 6/24/16.
 * TODO directives/dragAndDrop is the version we have been using. -Cole 
 */


app.directive( 'dragAndDrop', [
    '$log', function ( $log ) {
        return {
            restrict: 'A',
            scope: {
                onDrop: '='
            },
            link:     function ( scope, elem, attr ) {

                elem.bind( 'dragover', function ( e ) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                } );
                elem.bind( 'dragenter', function ( e ) {
                    e.stopPropagation();
                    e.preventDefault();

                } );
                elem.bind( 'dragleave', function ( e ) {
                    e.stopPropagation();
                    e.preventDefault();

                } );
                elem.bind( 'drop', function ( e ) {

                    var droppedFiles = e.dataTransfer.files;

                    e.stopPropagation();
                    e.preventDefault();

                    if ( droppedFiles ) {
                        if (scope.onDrop)
                            scope.onDrop(droppedFiles );
                        else 
                            throw new Error("No drop callback you dingus!");
                    }


                } );

            }
        };
        
    } ] );