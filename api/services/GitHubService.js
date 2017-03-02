/**
 * Created by mkahn on 3/1/17.
 */
var util = require('util');
var Promise = require('bluebird');
var _ = require('lodash');
var shell = require( 'shelljs' );
var path = require('path');

// module.exports.github = {
//
//     repository: 'git@github.com:Overplay/bellini-device-mgr.git',
//
//     //Comment this guy out to autodetect
//     branch: 'master'
//
// };

function execPromise(command){
    return new Promise( function(resolve, reject){
        shell.exec( command, function ( code, stdout, stderr ) {
            var response = { code: code, stdout: stdout, stderr: stderr };
            code ? reject(response) : resolve(response);
        });
    });
}

module.exports = {

    updateFromOrigin:  function(phoneNumber, messageObj) {

        if ( !sails.config.github )
            return new Error('No config/github.js file. Cannot proceed.');

        var branch = sails.config.github.branch || shell.exec('git rev-parse --abbrev-ref HEAD').stdout;
        //This runs in the project root folder, but this is here to double check :)
        var pwd = shell.pwd().stdout;
        sails.log.silly( ">>>> GitHubService is in folder: " + pwd + " on branch: " + branch );

        execPromise('git pull origin '+branch)
            .then( function(resp){
                sails.log.silly( ">>>> GitHubService just ran a GitHub pull. Code: " + resp.code );
                sails.log.silly( ">>>> GitHubService clean exit, gonna update npms and bowers for this project" );

                //Let's edit the template for the footer on the homepage
                shell.rm('./views/partials/branchinfo.ejs');
                var footer = '<p>Branch: ['+branch+'] pulled at: '+new Date()+'</p>';
                shell.echo(footer).to( './views/partials/branchinfo.ejs');

                if (!sails.config.github.updateNpms)
                    return Promise.resolve([]);

                return Promise.all(sails.config.github.updateNpms.map( function(folder){
                    var fullPath = path.join( pwd, folder );
                    return execPromise('cd '+fullPath)
                        .then( function(){ return execPromise('npm update')});
                }));
            })
            .then( function(npmUpdates){
                sails.log.silly("NPM updates are done. " + npmUpdates.length + " updates were done");
                if ( !sails.config.github.updateBower )
                    return Promise.resolve( [] );

                return Promise.all( sails.config.github.updateBower.map( function ( folder ) {
                    var fullPath = path.join( pwd, folder );
                    return execPromise( 'cd ' + fullPath )
                        .then( function () { return execPromise( 'bower update' )} );
                } ) );
            })
            .then( function ( bowerUpdates ) {
                sails.log.silly( "Bower updates are done. " + bowerUpdates.length + " updates were done" );
                sails.log.silly( "All updates done" );

                if (sails.config.github.noPm2Restart)
                    sails.log.silly( "No pm2 restart flag in github.js, so we're done!" );
                
                //TODO this should be more intelligent and not just restart every microservice!
                shell.exec("pm2 restart all");

            })
            .catch( function(err){
                sails.log.error( "Update chain failed!")
                sails.log.error( err.stderr );

            })
        
    }
};