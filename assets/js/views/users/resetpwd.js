/**
 * Created by mkahn on 4/5/16.
 */

var app = angular.module( 'resetApp', [ 'ui.bootstrap', 'ngAnimate', 'nucleus.service' ] );

app.controller( "resetController", function ( $scope, $log, nucleus, $window ) {

    // Using this method instead of $location.search() because search() is broken with # routes
    function getParameterByName( name, url ) {
        if ( !url ) url = window.location.href;
        name = name.replace( /[\[\]]/g, "\\$&" );
        var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)", "i" ),
            results = regex.exec( url );
        if ( !results ) return null;
        if ( !results[ 2 ] ) return '';
        return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ) );
    }


    $scope.user = {password2: "", password: ""};
    $scope.validate = {length: true, match: true};

    var resetToken = getParameterByName('token');
    var email = getParameterByName( 'email' );
    
    $scope.passwordOK = function () {

        var lenOK = $scope.user.password.length > 7;
        var match = $scope.user.password == $scope.user.password2;

        return match && lenOK;
    }

    $scope.reset = function () {

        // TODO: do something useful and throw up toasts
        nucleus.changePassword({ email: email, newpass: $scope.user.password, resetToken: resetToken })
            .then( function(){
                $window.location.href = '/login'
            })
            .catch( function(err){
                $log.log(err)
                $log.error("Change fail, do something useful!");
            })
    }

} );