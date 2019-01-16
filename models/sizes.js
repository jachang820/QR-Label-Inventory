'use strict';
module.exports = (sequelize, DataTypes) => {
  var Sizes = sequelize.define('Sizes', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    innerSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    outerSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  });

  return Sizes;
};