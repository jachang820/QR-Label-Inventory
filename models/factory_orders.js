'use strict';
module.exports = (sequelize, DataTypes) => {
  var FactoryOrders = sequelize.define('FactoryOrders', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE
    },
    label: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.STRING,
    }
  });

  FactoryOrders.associate = models => {
    FactoryOrders.hasMany(models.Items);
  }

  return FactoryOrders;
};