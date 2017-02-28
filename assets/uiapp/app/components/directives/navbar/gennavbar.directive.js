/**
 * Created by cgrigsby on 5/4/16.
 */


app.directive("genNavigationBar", function ($log, navBarService) {
        return {
            restrict: 'E',
            templateUrl: "/uiapp/app/components/directives/navbar/gennavbar.template.html",
            link: function (scope, element, attrs) {
                scope.menus = navBarService.getMenuForRoles();

                scope.$on("navBarUpdate", function(event, r) {
                    scope.menus = navBarService.getMenuForRoles(r);
                })
            }

        }

    }
);


app.directive("navTabs", function ($log) {
    return {
        restrict: 'A',
        scope: {
            menus: '=',
            ui: '='
        },
        templateUrl: "/uiapp/app/components/directives/navbar/gennavbartabs.template.html",
        link: function (scope, element, attrs) {
            scope.dropdown = function (menu) {
                return menu.items.length > 1;
            };

            scope.hrefLink = function (option) {
                return option.link.type == "href";
            };

            scope.close = function () {
                scope.ui.navCollapsed = true;
            }

        }
    }


});
    