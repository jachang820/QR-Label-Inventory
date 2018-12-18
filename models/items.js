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
      values: ['Ordered', 'In stock', 'Shipped'],
      allowNull: false
    }
  });

  Items.associate = models => {
    Items.belongsTo(models.Colors);
    Items.belongsTo(models.Styles);
    Items.belongsTo(models.FactoryOrders);
    Items.belongsTo(models.CustomerOrders);
    Items.belongsTo(models.InnerBoxes);
    Items.belongsTo(models.OuterBoxes);
  }

  return Items;
};