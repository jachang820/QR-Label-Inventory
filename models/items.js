'use strict';
module.exports = (sequelize, DataTypes) => {
  var Item = sequelize.define('Item', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Ordered', 'In stock', 'Shipped'],
      allowNull: false
    },
    innerbox: {
      type: DataTypes.UUID
    },
    outerbox: {
      type: DataTypes.UUID
    }
  });

  Item.associate = models => {
    Item.belongsTo(models.Color);
    Item.belongsTo(models.Style);
    Item.belongsTo(models.FactoryOrder);
    Item.belongsTo(models.CustomerOrder);
  }

  return Item;
};