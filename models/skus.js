'use strict';
module.exports = (sequelize, DataTypes) => {
  let SKUs = sequelize.define('SKUs', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    upc: {
      type: DataTypes.STRING(12)
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  SKUs.associate = models => {
    SKUs.belongsTo(models.Colors);
    SKUs.belongsTo(models.Sizes);
  };

  return SKUs;
}