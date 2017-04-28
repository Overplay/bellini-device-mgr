/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a User
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.auth.attributes({

      // 0 = god, 1 = device, 2 = user,  3 = disabled used(?)
      ring: {
          type:       "integer",
          defaultsTo: 3
      },
    
  }),
  
  beforeCreate: require('waterlock').models.auth.beforeCreate,
  beforeUpdate: require('waterlock').models.auth.beforeUpdate
};
