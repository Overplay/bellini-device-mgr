/**
 * Session Configuration
 * (sails.config.session)
 *
 * Sails session integration leans heavily on the great work already done by
 * Express, but also unifies Socket.io with the Connect session store. It uses
 * Connect's cookie parser to normalize configuration differences between Express
 * and Socket.io and hooks into Sails' middleware interpreter to allow you to access
 * and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.session.html
 */

module.exports.session = {

    /***************************************************************************
     *                                                                          *
     * Session secret is automatically generated when your new app is created   *
     * Replace at your own risk in production-- you will invalidate the cookies *
     * of your users, forcing them to log in again.                             *
     *                                                                          *
     ***************************************************************************/
    secret: 'ddc8d0aa785ece2f935cc4a74cdb680f',
    // By having a specific key, we avoid issues with one instance crapping on another
    key:    'bdm.sid',


    /***************************************************************************
     *                                                                          *
     * Set the session cookie expire time The maxAge is set by milliseconds,    *
     * the example below is for 24 hours                                        *
     *                                                                          *
     ***************************************************************************/

    // cookie: {
    //   maxAge: 24 * 60 * 60 * 1000
    // },

    // cookie: {
    //     domain: "localhost"
    // },

    /***************************************************************************
     *                                                                          *
     * In production, uncomment the following lines to set up a shared redis    *
     * session store that can be shared across multiple Sails.js servers        *
     ***************************************************************************/

     adapter: 'connect-redis',

    /***************************************************************************
     *                                                                          *
     * The following values are optional, if no options are set a redis         *
     * instance running on localhost is expected. Read more about options at:   *
     * https://github.com/visionmedia/connect-redis                             *
     *                                                                          *
     *                                                                          *
     ***************************************************************************/

    // host: 'localhost',
    // port: 6379,
    // ttl: <redis session TTL in seconds>,
    // db: 0,
    // pass: <redis auth password>,
    // prefix: 'sess:',


    /***************************************************************************
     *                                                                          *
     * Uncomment the following lines to use your Mongo adapter as a session     *
     * store                                                                    *
     *          TODO adapt this to make sure sessions are correct time          *
     ***************************************************************************/

    // adapter:    'mongo',
    // host:       'localhost',
    // port:       27017,
    // db:         'bellinisessions',
    // collection: 'sessions',

    /***************************************************************************
     *                                                                          *
     * Optional Values:                                                         *
     *                                                                          *
     * # Note: url will override other connection settings url:                 *
     * 'mongodb://user:pass@host:port/database/collection',                     *
     *                                                                          *
     ***************************************************************************/

    // username: '',
    // password: '',
    // auto_reconnect: false,
    // ssl: false,
    // stringify: true

};
