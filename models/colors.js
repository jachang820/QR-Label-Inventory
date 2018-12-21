'use strict';
module.exports = (sequelize, DataTypes) => {
  var Colors = sequelize.define('Colors', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  });

  return Colors;
};