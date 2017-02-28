app.directive( 'userData', function(){

    return {
        restrict:    "E",
        templateUrl: "/uiapp/app/components/directives/userdata/userdata.template.html",
        scope: {
            user: '=',
            ui: '='
        },
        link:  function ( scope, element, attrs ) {

            var zed = 4;

        }
    }
});

