/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var Promises = require( 'bluebird' );

module.exports.bootstrap = function ( cb ) {


    var coreRoles = sails.config.roles.coreRoles;

    var chain = Promise.resolve();

    coreRoles.forEach( function ( role ) {

        chain = chain.then( function () {
            return Role.findOrCreate( role )
                .then( function ( r ) {
                    if ( r ) {
                        sails.log.debug( "Role created: " + r.roleName );
                        return r;
                    }
                    throw new Error( "Could not create role: " + role.roleName );

                } );
        } );

    } );

    chain = chain
        .then( RoleCacheService.sync )
        .then( function () {

            var adminUser = {
                firstName: 'Admin',
                lastName: 'Pre-installed',
                metadata: {preinstall: true},
                roles: [RoleCacheService.roleByName("admin", ''), RoleCacheService.roleByName("user", '')]
            }

            return AdminService.addUser('admin@test.com', 'beerchugs', adminUser, false)
                .then( function () { sails.log.debug( "Admin user created." )} )
                .catch( function () { sails.log.warn( "Admin user NOT created. Probably already existed." )} );

        } )
        .then( function () {

            var roles = [ RoleCacheService.roleByName( "admin", '' ) , RoleCacheService.roleByName("user", '')];

            return AdminService.addUser( 'admin2@test.com', 'beerchugs', { roles: roles } )
                .then( function () { sails.log.debug( "Admin user created." )} )
                .catch( function () { sails.log.warn( "Admin user NOT created. Probably already existed." )} );

        } )

        .then( function () {

            var roles = [ RoleCacheService.roleByName( "user", '' ) ];

            return AdminService.addUser( 'general@test.com', 'beerchugs', { roles: roles } )
                .then( function () { sails.log.debug( "General user created." )} )
                .catch( function () { sails.log.warn( "General user NOT created. Probably already existed." )} );

        } )

        .then( function () {
            sails.config.testdata.install();
            sails.log.debug( "Inserts done" );
            return true;
        } )
        .then( function () {
            sails.log.debug( "Bootstrapping SAILS done" );
        } );


    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    
    cb();
};
