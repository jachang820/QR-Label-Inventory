'use strict';
module.exports = (sequelize, DataTypes) => {
  let Skus = sequelize.define('Skus', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    upc: {
      type: DataTypes.STRING(12),
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

  Skus.associate = models => {
    Skus.belongsTo(models.Colors);
    Skus.belongsTo(models.Sizes);
  };

  return Skus;
}