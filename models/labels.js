'use strict';
module.exports = (sequelize, DataTypes) => {
  var Labels = sequelize.define('Labels', {
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
    }
  });

  return Labels;
};