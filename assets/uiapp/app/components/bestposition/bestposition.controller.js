/**
 * Created by ryanhartzell on 11/3/16.
 */


app.controller('bestPositionListController', function ($scope, $rootScope, $state, $http, nucleus, $log, links, $anchorScroll, $location, toastr) {
    $log.debug("bestPositionListController");
    $scope.loadingData = true;
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.AJPGSUrl = $rootScope.AJPGSUrl;

    $scope.models = [];
    $scope.pageSize = 50;
    $scope.currentPage = 1;
    $scope.multiEditIds = [];
    $scope.widgetPositions = [];
    $scope.crawlerPositions = [];
    //$log.log(models[0])

    $http.get('http://'+$scope.AJPGSUrl+'/BestPosition/findAll')
        .then( function (data) {
            $scope.models = data.data;
            $scope.loadingData = false;
        })
        .catch( function (err) {
            $scope.loadingData = false;
            toastr.error("Unable to fetch best position models. Please try again later.", "Error");
        });


    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }

    $scope.selectOne = function (id) {
        var index = _.indexOf($scope.multiEditIds, id);
        if (index === -1) {
            $scope.multiEditIds.push(id);
            if ($scope.multiEditIds.length === $scope.results.length)
                $scope.allSelected = true;
        }
        else {
            $scope.multiEditIds.splice(index, 1);
            $scope.allSelected = false;
        }
    }

    $scope.selectAll = function () {
        if ($scope.multiEditIds.length !== $scope.results.length) {
            $scope.multiEditIds = [];
            _.forEach($scope.results, function (o) {
                $scope.multiEditIds.push(o.id);
                o.selected = true;
            });
        }
        else {
            $scope.multiEditIds = [];
            _.forEach($scope.results, function (o) { o.selected = false; })
        }
    }

})

app.controller('bestPositionMultiEditController', function ($scope, $rootScope, $state, nucleus, $log, $http, links, toastr, ids) {
    $log.debug("bestPositionMultiEditController starting");
    $scope.$parent.ui.pageTitle = "Edit Best Position Models";
    $scope.$parent.ui.panelHeading = "Editing " + ids.length + " Models";
    $scope.$parent.links = links;
    var AJPGSUrl = $rootScope.AJPGSUrl;
    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top'];
    $scope.updating = {
        active: false,
        count: 0
    };

    $scope.model = {
        adPosition: "",
        crawlerPosition: ""
    };

    // change states if not a multiedit
    if (ids.length === 1)
        $state.go('bestposition.edit', { id: ids[0], url: url});
    if (ids.length === 0) {
        toastr.warning("There were no items selected to edit", "No Items!");
        $state.go('bestposition.list');
    }

    $scope.update = function () {
        if (!$scope.model.adPosition || !$scope.model.crawlerPosition)
            toastr.error("You must select both ad and crawler positions", "Can't Save");
        else {
            var promises = [];
            $scope.updating.active = true; // used to show progress bar

            _.forEach(ids, function (id) {
                promises.push(
                    $http.put("https://"+AJPGSUrl+"/bestPosition/" + id, $scope.model)
                        .then( function () {
                            $scope.updating.count++; // adjust progress bar...progress
                        })
                )
            })

            Promise.all(promises).then( function () {
                $scope.updating.active = false;
                $scope.updating.count = 0;
                toastr.success("Best positions updated", "Success!");
            })
        }
    }
})


app.controller('bestPositionEditController', function ($scope, $rootScope, $state, nucleus, $log, links, model, $http, toastr) {
    $log.debug("bestPositionEditController");
    $scope.model = model;
    var AJPGSUrl = $rootScope.AJPGSUrl;

    $scope.$parent.ui.pageTitle = "Edit Best Position";
    $scope.$parent.ui.panelHeading = model.type == 'network' ? "Network: " + model.network : "Series: " + model.seriesName;
    $scope.$parent.links = links;

    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top']
    

    $scope.update = function() {
        //TODO url
        $http.put("https://"+AJPGSUrl+"/bestPosition/" + $scope.model.id, $scope.model)
            .then(function(l){
                $log.log(l)
                toastr.success("Positions updated!", "Nice!")
            })
    }
})