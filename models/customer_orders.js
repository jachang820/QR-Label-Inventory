'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerOrders = sequelize.define('CustomerOrders', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.STRING
    }
  });

  CustomerOrders.associate = models => {
    CustomerOrders.hasMany(models.Items);
    CustomerOrders.belongsTo(models.Users, {
      foreignKey: 'ShippedBy',
      targetKey: 'email',
      constraints: false,
      allowNull: true
    });
  }

  return CustomerOrders;
};