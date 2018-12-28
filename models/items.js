'use strict';
module.exports = (sequelize, DataTypes) => {
  var Items = sequelize.define('Items', {
    id: {
      type: DataTypes.UUID,
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
    arrivalDate: {
      type: DataTypes.DATE
    }
  });

  Items.associate = models => {
    Items.belongsTo(models.Colors);
    Items.belongsTo(models.Sizes);
    Items.belongsTo(models.FactoryOrders);
    Items.belongsTo(models.CustomerOrders);
    Items.belongsTo(models.Users, {
      foreignKey: 'receivedBy',
      targetKey: 'email',
      constraints: false,
      allowNull: true
    });
  }

  return Items;
};