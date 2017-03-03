/**
 *
 * GitHub settings for implementing the GitHub update Webhook
 * 
 * The assumption is that the remote is on "origin" and has been set up already
 *
 */

module.exports.github = {

    repository: 'git@github.com:Overplay/bellini-device-mgr.git',
    
    //Comment this guy out to autodetect
    branch: 'master',
    
    //Add folders to run npm update and bower update in
    updateNpms: [ './' ],
    updateBower: ['./assets', './assets/blueline/common' ]

};