/**
 * Created by mkahn on March 2017
 */


app.directive("dmNavBar", function ($window, $log) {
        return {
            restrict: 'E',
            templateUrl: "/uiapp/app/components/directives/navbardm/navbardm.template.html",
            link: function (scope, element, attrs) {

                scope.isNavCollapsed = false;

                function autoCollapse(){
                    var width = $window.innerWidth;
                    //$log.debug("Width: "+ width);
                    if ( width < 768 ) {
                        scope.isNavCollapsed = true;
                        scope.$apply();
                    }
                }

                angular.element( $window ).bind( 'resize', autoCollapse);

                autoCollapse();
            }

        }

    }
);



    