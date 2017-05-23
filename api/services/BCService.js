


module.exports = {

    Venue: {

        findByUUID: function(uuid){

            return ProxyService.get(sails.config.uservice.belliniCore.url + '/venue/findByUUID', { uuid: uuid })
                .then( function(resp){
                    return resp.body;
                });
        },

        findAllReal: function(){

            return ProxyService.get( sails.config.uservice.belliniCore.url + '/venue/all', { virtual: false })
                .then( function(resp){
                    return resp.body;
                });

        }

    }



}