/**
 * Created by mkahn on 4/7/16.
 */

var Promise = require( 'bluebird' );

var _theme = undefined;

module.exports =  {


    // Universal function to get theme
    getTheme: function () {
        if (_theme === undefined) {
            if (sails.config.theme && sails.config.theme.themeName)
                _theme = "-" + sails.config.theme.themeName;
            else
                _theme = "";
        }

        return _theme;

    }
}