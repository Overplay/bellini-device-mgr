/*app.directive('dragAndDrop', [
    '$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                });
                elem.bind('dragenter', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                });
                elem.bind('dragleave', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                });
                elem.bind('drop', function (e) {

                    var droppedFiles = e.dataTransfer.files;

                    e.stopPropagation();
                    e.preventDefault();

                    if (droppedFiles) {
                        $rootScope.$broadcast('droppedFile', droppedFiles);
                    }


                });

            }
        };
    }]);*/