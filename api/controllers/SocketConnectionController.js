/**
 * SocketConnectionController
 *
 * @description :: Server-side logic for managing Socketconnections
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    rooms: function(req, res){

        var rooms = sails.sockets.rooms();
        return res.ok(rooms);

    }
	
};

