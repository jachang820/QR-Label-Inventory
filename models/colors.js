'use strict';
module.exports = (sequelize, DataTypes) => {
  var Colors = sequelize.define('Colors', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    color: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  return Colors;
};