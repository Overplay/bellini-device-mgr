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

    },

    join: function(req, res){

        if ( !req.isSocket ) {
            return res.badRequest( { error: "Sockets only, sonny" } );
        }

        if ( req.method !== 'POST' )
            return res.badRequest( { error: "That's not how to subscribe, sparky!" } );

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.room )
            return res.badRequest( { error: "Missing params" } );

        sails.sockets.join( req, params.room );

        // Broadcast a notification to all the sockets who have joined
        // the "funSockets" room, excluding our newly added socket:
        sails.sockets.broadcast( params.room,
            params.room,
            { message: 'Welcome to the room for ' + params.room });

        return res.ok( { message: 'joined' } );

    },

    send: function(req, res){

        //OK, we need a deviceUDID
        var params = req.allParams();

        if ( !params.room || !params.message )
            return res.badRequest( { error: "Missing params" } );


        sails.sockets.broadcast( params.room,
            params.room,
            params.message,
            params.echo ? null : req );

        return res.ok();
    }
	
};

