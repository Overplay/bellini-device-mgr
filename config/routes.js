/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    // Example of how to do the homepage using EJS
    '/template-home': {
        view: 'homepage'
    },

    // Examples of how to do the
    '/template': {
        view:   'ejs-example',
        locals: { title: 'My Cool Template!', myMessage: 'This is passed to the view, homie!' }
    },

    '/appmodel/:appid/:deviceid': {
        controller: 'AppDataController',
        action:     'appDataForDevice',
        skipAssets: true
    },

    '/appmodel/initialize': {
        controller: 'AppDataController',
        action:     'initialize',
        skipAssets: true
    },

    '/appmodel/initializeVenueData': {
        controller: 'AppDataController',
        action:     'initializeVenueData',
        skipAssets: true
    },

    /****************************************************************************
     * App Client Control Routes
     ****************************************************************************/

    '/appcontrol/:appId/:deviceUDID': {
        controller: "AppControlController",
        action:     "chooseEndpoint",
        skipAssets: true
    },

    // The trick below actually works! But isn't needed now
    // '/blueline/control': {
    //     controller: "AppControlController",
    //     action:     "chooseEndpoint",
    //     skipAssets: true
    // },

    /****************************************************************************
     *  SocialScrape vanity routes
     ****************************************************************************/

    // '/socialscrape/result/:appId/:deviceUDID': {
    //     controller: 'SocialScrapeController',
    //     action: 'result',
    //     skipAssets: true
    // },

    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/

    '/': 'LandingController.landing',

    '/signup': 'AuthController.signupPage',

    '/login': 'AuthController.loginPage',

    '/logout': 'AuthController.logoutPage',

    '/resetpwd': 'AuthController.resetPwd',

    '/ui': "UIController.uiApp",

    '/validated': 'AuthController.validatedOk'




};
