/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a User
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.auth.attributes({

      // 1 = god, 2 = device, 3 = user,  4 = disabled used(?)
      // 0/undefined = fuck off matey
      ring: {
          type:       "integer",
          defaultsTo: 3
      },
    
  }),
  
  beforeCreate: require('waterlock').models.auth.beforeCreate,
  beforeUpdate: require('waterlock').models.auth.beforeUpdate
};
