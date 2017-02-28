/**
 * Role.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    roleName: {
      type: 'string',
      required: true
    } ,

    subRole: {
      type: 'string',
      defaultsTo: ''
    },

    toJSON: function () {
      var obj = this.toObject();

      obj.roleKey = obj.roleName + ( obj.subRole ? "."+obj.subRole : "");
      
      return obj;
    }

  }
  
};

