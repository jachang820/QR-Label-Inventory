'use strict';
module.exports = (sequelize, DataTypes) => {
  var Style = sequelize.define('Style', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    style: {
      type: DataTypes.STRING,
      unique: true
    }
  });

  return Style;
};