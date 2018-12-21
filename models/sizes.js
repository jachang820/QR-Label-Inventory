'use strict';
module.exports = (sequelize, DataTypes) => {
  var Sizes = sequelize.define('Sizes', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  });

  return Sizes;
};