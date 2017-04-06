

module.exports = {
    
    maint: function(typeOfMaintenance){
    
        typeOfMaintenance = typeOfMaintenance || 'REMOVE_INVALID';
        
        switch (typeOfMaintenance){
            
            case 'REMOVE_INVALID':
                
                // Invalid means either the deviceUDID is not in the DB as a real device, or the AppID is not
                sails.log.silly("Performing a 'REMOVE_INVALID' on all scrape objects");
                break;
                
            case 'DELETE_ALL':
                sails.log.silly( "Performing a 'DELETE_ALL' on all scrape objects" );
                return SocialScrape.destroy({});
            
        }
        
    }
}