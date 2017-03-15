/**************************************

Database Maintenance tasks

***************************************/

module.exports = {

    removeDanglingUsers: function(){

        User.find()
            .then( function(allUsers){
                sails.log.silly('There are '+users.length+' total users');
                var losers = _.remove(allUsers, function(u){ return !u.auth; });
                sails.log.silly("And "+losers.length+' losers.');
                return allUsers.length - losers.length;
            });

    }
}