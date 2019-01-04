'use strict';
module.exports = (sequelize, DataTypes) => {
  var Sizes = sequelize.define('Sizes', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    innerSize: {
      type: DataTypes.INTEGER
    },
    outerSize: {
      type: DataTypes.INTEGER
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Sizes;
};