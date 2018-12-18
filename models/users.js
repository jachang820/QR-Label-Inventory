'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    authlevel: {
      type: DataTypes.INTEGER,
      allowNull: false
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