'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerOrder = sequelize.define('CustomerOrder', {
    uuid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    orderid: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.STRING
    }
  });

  CustomerOrder.associate = models => {
    CustomerOrder.hasMany(models.Item);
  }

  return CustomerOrder;
};