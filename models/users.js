'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING
    }
  });

  User.addUser = function(username, password) {
    return this.create({
      username,
      password
    });
  };

  User.removeUser = function(id) {
    return this.destroy({ where: { id } });
  };

  User.getAllUsers = function() {
    return this.findAll();
  }

  User.json = function() {
    return {

    }
  }

  return User;
};