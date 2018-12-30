'use strict';
module.exports = (sequelize, DataTypes) => {
  var FactoryOrders = sequelize.define('FactoryOrders', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING
    },
    arrivalDate: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.STRING
    }
  });

  FactoryOrders.associate = models => {
    FactoryOrders.hasMany(models.Items);
  }

  return FactoryOrders;
};