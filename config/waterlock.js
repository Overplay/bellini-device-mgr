/**
 * waterlock
 *
 * defines various options used by waterlock
 * for more informaiton checkout
 *
 * http://waterlock.ninja/documentation
 */

var URL = 'http://107.170.209.248';
module.exports.waterlock = {

    // Base URL
    //
    // used by auth methods for callback URI's using oauth and for password
    // reset links.
    baseUrl: URL,

    alwaysValidate: false, // force account validation always

    // Auth Method(s)
    //
    // this can be a single string, an object, or an array of objects for your
    // chosen auth method(s) you will need to see the individual module's README
    // file for more information on the attributes necessary. This is an example
    // of the local authentication method with password reset tokens disabled.
    authMethod: [
        {
            name: 'waterlock-local-auth',
            passwordReset:    {
                tokens:   true,
                mail:     {
                    protocol:   'SMTP',
                    options:    {
                        service: 'SendGrid',
                        auth:    {
                            user: 'USER', // These are set in local.js in our fork of waterlock-local-auth
                            pass: 'PASS'  //
                        }
                    },
                    from:       'no-reply@ourglass.tv',
                    subject:    'You forgot how to Ourglass!',
                    forwardUrl: URL + '/auth/resetPwd' 
                },
                template: {
                    file: '/home/cgrigsby/Development/sails/asahi/views/emails/email.jade',
                    vars: {}
                }
            },
            validateAccount:         {

                template: {
                    file: '../views/emails/validateemail.jade',
                    vars: {}
                },
                redirectOnValidateUrl: '/validated'

            },
            createOnNotFound: false // MAK: otherwise it autocreates account
        },
        {
            name: "waterlock-facebook-auth",
            appId: "116037555501905",
            appSecret: "687340f68620fb47a6bf11d0cc8574d3",
            fieldMap: {
                'firstName': 'first_name',
                'lastName': 'last_name'
            },
            doubleReqRedirect: "/logout",
            newUserRedirect: "users/signup-ourglass.ejs"
        }
    ],

    // JSON Web Tokens
    //
    // this provides waterlock with basic information to build your tokens,
    // these tokens are used for authentication, password reset,
    // and anything else you can imagine
    jsonWebTokens: {

        // CHANGE THIS SECRET
        secret:   'HiggsBoson',
        expiry:   {
            unit:   'days',
            length: '7'
        },
        audience: 'Nucleus',
        subject:  'Proton',

        // tracks jwt usage if set to true
        trackUsage: true,

        // if set to false will authenticate the
        // express session object and attach the
        // user to it during the hasJsonWebToken
        // middleware
        stateless: false,

        // set the name of the jwt token property
        // in the JSON response
        tokenProperty: 'token',

        // set the name of the expires property
        // in the JSON response
        expiresProperty: 'expires',

        // configure whether or not to include
        // the user in the respnse - this is useful if
        // JWT is the default response for succesfull login
        includeUserInJwtResponse: false
    },

    // Post Actions
    //
    // Lets waterlock know how to handle different login/logout
    // attempt outcomes.
    postActions: {

        // post login event
        login: {

            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            //success: '{"message": "success"}',
            success: '{"message":"success"}',

            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            failure: '{"message": "failure"}'
        },

        //post logout event
        logout:   {

            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            success: '{"message": "success"}',

            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            failure: '{"message": "failue"}'
        },
        // post register event
        register: {
            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            success: '{"message": "success"}',
            // This can be any one of the following
            //
            // url - 'http://example.com'
            // relativePath - '/blog/post'
            // obj - {controller: 'blog', action: 'post'}
            // string - 'custom json response string'
            // default - 'default'
            failure: '{"message": "failure"}'
        }
    }
};
