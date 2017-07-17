/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

    // Everything open by default, but with some template vars set so we know what up

    // Normally set to false
    '*': true,

    LandingController: {
        landing: [ 'authDecorator', 'authRedirect' ]
    },


    EJSExampleController: {
        restricted: [ 'authDecorator', 'sessionAuth' ],
        open:       true,
        admin:      [ 'authDecorator', 'isRingAdmin' ]
    },

    /**
     *
     *  The login page is open to all, as it should be.
     *  POSTs to auth/login are also open, though we may want to consider locking this down with some
     *  2 step process: get a token, do a login.
     *
     */



    AuthController: {
        '*':         'isRingAdmin', //really protect auth
        'loginPage': true,
        // TODO some sort of policy on to many logins from same IP address
        'login':     true
        // 'find':    [ 'isRingAdmin' ],
        // 'findOne': [ 'authProtection' ], //tricky for manager list and whatnot
        // 'update':  [ 'authProtection' ],
        // 'destroy': [ 'authProtection' ], //maybe me?
        // 'register': [ 'isRingAdmin' ], //not even used anywhere
        // 'addUser': true, //used in SignupApp through nucleus service
        // 'resetPwd': ['passwordReset'],
        // 'register': false, //we use a differnet registration than waterlock
        // //changePw own policy because it could be an authenticated user OR a reset token
        // 'changePwd': ['passwordChange'] //this is tricky becuase of pw reset...
    },

    MediaController: {
        '*': 'isRingAdmin',
        'downloadFromCore': true
    },

    OGLogController: {
        '*':       'isRingAdmin',
        'create':  false,
        'postlog': true, // TODO: Bad policy?? [ 'isDevice', 'hasValidatedDeviceUDID' ],
        'wipeem' : [ 'isRingAdmin', 'isDELETE']
    },

    SMSController: {
        '*':      'isRingAdmin',
        'notify': [ 'limitSMS', 'tempAuth' ]
    },

    UserController: {
        '*': 'isRingAdmin',
        'coreuserfortoken': true,
        'isusermanager': true
    },

    // TODO this needs to check auth on 2000
    VenueController: {
        '*':          true
    },

    //AuthController: [ 'sessionAuth', 'meOrAdmin' ],

    UIController: {
        'uiApp': [ 'forceAnonToLogin', 'authDecorator', 'sessionAuth' ]
    },

    // TODO: this is very insecure, for now
    OGDevice: {
        '*': true,
        'purge': ['isRingAdmin', 'isDELETE'],
        'regcode': ['isDevice'],
        'checkconnection': [ 'isSOCKETPOST', 'hasDeviceUDID' ]
        // 'findByRegCode': true,
        // 'findByUDID': true,
        // 'changeName': true,
        // 'register': true,
        // 'tickle': true,
        // 'appstatus': true
    },

    // Override this in local.js for testing
    wideOpen: false

};