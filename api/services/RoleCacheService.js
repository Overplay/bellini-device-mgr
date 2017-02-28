/**
 * Created by mkahn on 4/12/16.
 */

/**
 * Role lookup is done so often and is a bitch on Promises (try looking up 3 roles and attaching to a user)
 * that we're going to load them at boot time and just cache it. If a new role is added, the code must call
 * the sync method here.
 *
 */

var Promise = require("bluebird");

var _idToRoleMap = {};
var _adminRole = undefined; 

function idToRoleString(roleId) {

    var role = _idToRoleMap["" + roleId];

    if (!role)
        throw new Error("No such role!");

    return role.roleName + (role.subRole ? "." + role.subRole : "" );


}

module.exports = {

    sync: function () {
        
        return new Promise( function(resolve, reject){
        
            _idToRoleMap = {}; // Purge. DB is canonical.

            Role.find()
                .then( function ( roleArray ) {
                    roleArray.forEach( function ( role ) {

                        // Make the key a string. Necessary?
                        var key = String( role.id );
                        _idToRoleMap[ key ] = role;

                        if ( role.roleName == "admin" )
                            _adminRole = role.id;

                    } );
                    sails.log.debug("Roles synched. "+roleArray.length+" roles found.");
                    resolve( _idToRoleMap );
                } )
                .catch(reject); // This is a cluster if this happens!
        
        });

    },

    roleStringForId: idToRoleString,

    /**
     * Can also pass in a dotted key style as roleName: proprietor.owner
     * @param roleName (can be dotted)
     * @param subName (optional)
     * @returns {*}
     */
    roleByName: function(roleName, subName ){

        if (roleName.indexOf('.')>=0){
            var bits = roleName.split('.');
            roleName = bits[0];
            subName = bits[1];
        }

        var role = _.find(_idToRoleMap, { roleName: roleName, subRole: subName || '' });
        
        if (role)
            return role.id;
            
        return -1;

    },

    getAllRolesAsStringArray: function (arrayOfRoleIds) {

        var rval = [];
        arrayOfRoleIds.forEach(function (rid) {
            rval.push(idToRoleString(rid));
        })

        return rval;

    },
    
    getRoleMap: function(){
        return _idToRoleMap;
    },

    hasAdminRole: function(roles){
        return roles.indexOf(_adminRole) > -1;
    },

    hasRole: function(roles, roleName, subName) {
        return roles.indexOf(this.roleByName(roleName, subName)) > -1;
    }



}