'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerOrders = sequelize.define('CustomerOrders', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['Retail', 'Wholesale'],
      allowNull: false
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  CustomerOrders.associate = models => {
    CustomerOrders.hasMany(models.Items);
  }

  return CustomerOrders;
};