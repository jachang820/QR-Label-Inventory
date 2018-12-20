'use strict';
module.exports = (sequelize, DataTypes) => {
  var Sizes = sequelize.define('Sizes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    size: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  return Sizes;
};