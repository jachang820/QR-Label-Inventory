'use strict';
module.exports = (sequelize, DataTypes) => {
  var FactoryOrder = sequelize.define('FactoryOrder', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    notes: {
      type: DataTypes.STRING,
    }
  });

  FactoryOrder.associate = models => {
    FactoryOrder.hasMany(models.Item);
  }

  return FactoryOrder;
};