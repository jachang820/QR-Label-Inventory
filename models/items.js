'use strict';
module.exports = (sequelize, DataTypes) => {
  var Items = sequelize.define('Items', {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Ordered', 'In Stock', 'Shipped'],
      allowNull: false
    },
    innerbox: {
      type: DataTypes.UUID
    },
    outerbox: {
      type: DataTypes.UUID
    },
    qrcode: {
      type: DataTypes.STRING
    }
  });

  Items.associate = models => {
    Items.belongsTo(models.SKUs);
    Items.belongsTo(models.FactoryOrders);
    Items.belongsTo(models.CustomerOrders);
  }

  return Items;
};