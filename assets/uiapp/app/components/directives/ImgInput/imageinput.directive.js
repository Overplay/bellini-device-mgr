/**
 * Created by mkahn on 6/20/16.
 */

app.directive('imgInput', function($log, $timeout){
    return {
        restrict: 'E',
        scope: {
            dirty: '=?',
            srcField: '=?',
            prompt: '@'
        },
        link: function ( scope, elem, attrs ){
            
            var w = attrs.width || '128';
            var h = attrs.height || '128';

            var placeholder = "http://placehold.it/" + w + 'x' + h;

            scope.exact = attrs.exact !== undefined;
            scope.ratio = attrs.ratio;
            scope.maxSize = attrs.maxSize !== undefined;

            var ratio = w/h;
            var reset = function(error) {
                showWarning(error);
                scope.img.mediaSrc = scope.srcField ? '/media/download/'+scope.srcField : placeholder;
                scope.dirty = null;
            };

            scope.warning = '';
            scope.img = {
                widthPx: w+'px',
                heightPx: h+'px',
                style: { "max-width": "50%" },
                mediaSrc: scope.srcField ? '/media/download/'+scope.srcField : placeholder
            }

            scope.filesDropped = function(files){

                $log.debug("Files dropped!");
                var fr = new FileReader();
                var acceptedTypes = ["image/png", "image/jpeg", "image/gif"]; //TODO gif???
                var img = new Image();

                img.onload = function() {
                    scope.$apply( function() {
                        if (scope.exact && (img.width != w || img.height != h))
                            reset("Image has invalid dimensions.");
                        else if (scope.ratio && img.width / img.height != ratio)
                            reset("Image does not match specified ratio.");
                        else if (scope.maxSize && (img.width > w || img.height > h))
                            reset("Image is too large.");
                        else
                            scope.img.mediaSrc = fr.result;
                    })
                };

                fr.onload = function () {

                    // Must force digest since onload event is outside of angular
                    scope.$apply( function() {
                        img.src = window.URL.createObjectURL(files[0]);
                        // scope.img.mediaSrc = fr.result;
                        scope.dirty = files[0]; // it's truthy and the file we want the Controller to upload
                    })
                };

                if (acceptedTypes.indexOf(files[0].type) <= -1) {
                    showWarning( "Error: invalid file type" );
                }
                else {
                    fr.readAsDataURL( files[0] );

                    // For testing only.
                    // showWarning( files[ 0 ].name );
                }

            }


            // This would be used to signal bad files, bad sizes.
            function showWarning(message) {
                scope.warning = message;
                $timeout( function(){ scope.warning="" }, 2000);
            }
        
        },
        templateUrl: '/uiapp/app/components/directives/ImgInput/imageinput.template.html'
    }

})

// lets you give a dbid as source
app.directive('nMedia', function(){

    return {
        restrict: 'A',
        link:     function ( scope, elem, attrs ) {

            attrs.$set( 'src', '/media/download/' + attrs.nSrc );

        }
    }

})