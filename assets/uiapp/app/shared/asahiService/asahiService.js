app.factory('asahiService', function ($log, $http) {
    var service = {};

    /**
     * Upload a media file. If there is an experience Id, then the photo is attached to the
     * experience.
     * @param file
     * @returns {deferred.promise|*}
     */


    //TODO limit file size stuff ???
    service.uploadMedia = function (file) {

        var fd = new FormData();

        fd.append('file', file);


        // Content-Type undefined supposedly required here, transformed elsewhere
        return $http.post('media/upload', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });

    }

    return service;
});