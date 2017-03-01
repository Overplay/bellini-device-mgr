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
        landing: ['authDecorator', 'authRedirect']
    },

    // Let's tighten down a bit on blog posts
    BlogPostController: {
        restricted: [ 'sessionAuth' ],
        open:       true,
        admin:      [ 'isAdmin' ]
    },

    EJSExampleController: {
        restricted: [ 'authDecorator', 'sessionAuth' ],
        open:       true,
        admin:      [ 'authDecorator', 'isAdmin' ]
    },

    /**
     *
     *  The login page is open to all, as it should be.
     *  POSTs to auth/login are also open, though we may want to consider locking this down with some
     *  2 step process: get a token, do a login.
     *
     */



    ActivationController: {
        '*': false,
        'generateCode': ['sessionAuth'] //just need to be logged in as any user 
    },
    AdController: {
        '*': true,
        'update': ['sessionAuth', 'isAdOwner'],
        'destroy': ['sessionAuth', 'isAdOwner'],
        'review': ['sessionAuth', 'isAdmin'],
        'pauseOrResume': ['sessionAuth', 'isAdOwner'],
        'setDelete': ['sessionAuth', 'isAdOwner'],
        'forReview': ['sessionAuth', 'isAdmin'],
        'editAd': ['sessionAuth', 'isAdOwner'],
        'getAccepted': true //TODO 
    },
    
    AuthController: {
        '*': true, //really protect auth
        'find':    [ 'sessionAuth', 'isAdmin' ],
        'findOne': ['sessionAuth', 'isVenueOwnerMeOrAdmin'], //tricky for manager list and whatnot
        'update':  [ 'sessionAuth', 'isAdmin' ],
        'destroy': ['sessionAuth', 'isAdmin'], //maybe me?
        'register': ['sessionAuth', 'isAdmin'], //not even used anywhere
        'addUser': true, //used in SignupApp through nucleus service
        'resetPwd': ['passwordReset'],
        'register': false, //we use a differnet registration than waterlock
        //changePw own policy because it could be an authenticated user OR a reset token 
        'changePwd': ['passwordChange'] //this is tricky becuase of pw reset... 
    },

    DeviceController: {
        '*': true,
        'find': ['sessionAuth', 'isDeviceManagerOrOwner'],
        'findOne': ['sessionAuth', 'isDeviceManagerOrOwner'],
        'update': ['sessionAuth', 'isDeviceOwner'],
        'destroy': ['sessionAuth', 'isDeviceOwner'],
        'registerDevice': ['sessionAuth'],
        'testDevice': ['sessionAuth'],
        //backup and restore todo
        'getUserRolesForDevice': ['GETOnly', 'hasJsonWebToken'],
        'verifyRequest': ['hasSameIP']

    },

    MediaController: {
        '*': true,
        'upload': ['sessionAuth'],
        'deleteAllEntries': false
    },

    OGLogController: {
        '*': true,
        'destroy': ['sessionAuth', 'isAdmin'],
        'upload': ['tempAuth']
    },

    SMSController: {
        '*': true,
        'notify': ['limitSMS', 'tempAuth']
    },

    UserController: {
        '*': ['sessionAuth'], //true,
        'find': ['sessionAuth', 'isAdmin'],
        'findOne': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'update':  [ 'sessionAuth', 'isMeOrAdmin' ],
        'destroy': [ 'sessionAuth', 'isAdmin' ],
        'inviteUser': ['sessionAuth', 'isProprietorOwner'],
        'inviteRole': ['sessionAuth', 'isProprietorOwner'],
        'findByEmail': ['sessionAuth', 'isProprietorOwner'],
        'getVenues': ['sessionAuth', 'isProprietorOwner'],
        'getDevices': ['sessionAuth', 'isProprietorOwner'],
        'getManagedDevices': ['sessionAuth', 'isProprietorManager'],
        'getAlist': ['sessionAuth', 'isAdvertiser'],
        'becomeAdvertiser': ['sessionAuth']

    },
    
    VenueController: {
        '*': ['sessionAuth'],
        'find': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'findOne': ['sessionAuth'], //issues with this one for device population
        'update': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'destroy': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'getVenueManagers': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'addManager': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'addOwner': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'removeManager': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'removeOwner': ['sessionAuth', 'isVenueOwnerMeOrAdmin'],
        'getMobileView': true //TODO 
    },
    

    RoleController: {
        '*':       true,
        'find':    [ 'sessionAuth', 'isAdmin' ],
        'findOne': [ 'sessionAuth', 'isAdmin' ],
        'update':  [ 'sessionAuth', 'isAdmin' ],
        'destroy': [ 'sessionAuth', 'isAdmin' ]

    },


    //AuthController: [ 'sessionAuth', 'meOrAdmin' ],

    UIController: {
        'uiApp': ['forceAnonToLogin', 'authDecorator', 'sessionAuth']
    },

    // Override this in local.js for testing
    wideOpen: true

};