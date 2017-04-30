


module.exports = {

    Venue: {

        findByUUID: function(uuid){

            return ProxyService.get('http://localhost:2000/venue/findByUUID', { uuid: uuid })
                .then( function(resp){
                    return resp.body;
                });
        },

        findAllReal: function(){

            return ProxyService.get('http://localhost:2000/venue/all', { virtual: false })
                .then( function(resp){
                    return resp.body;
                });

        }

    }



}