'use strict';
module.exports = (sequelize, DataTypes) => {
  var LabelUrls = sequelize.define('LabelUrls', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    prefix: {
      type: DataTypes.STRING,
      allowNull: false
    },
    style: {
      type: DataTypes.ENUM,
      values: ['Querystring', 'Path'],
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

  return LabelUrls;
};