'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var Item = sequelize.define('Item', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true,
      validate: {
        len: {
          args: [1, 7],
          msg: "SKU ID must be between 1-7 characters."
        }
      }
    },
    status: {
      type: DataTypes.ENUM,
      values: ['Ordered', 'In Stock', 'Shipped', 'Cancelled'],
      defaultValue: 'Ordered',
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Status must exist."
        },
        isIn: {
          args: [['Ordered', 'In Stock', 'Shipped', 'Cancelled']],
          msg: "Status is invalid."
        }
      }
    },
    created: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    hooks: {
      afterCreate: formatSerial('U')
    }
  });

  Item.associate = models => {
    Item.belongsTo(models.Sku, {
      foreignKey: 'sku'
    });
    Item.belongsTo(models.InnerCarton, {
      foreignKey: 'innerId'
    });
    Item.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId'
    });
    Item.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId'
    });
    Item.belongsTo(models.CustomerOrder, {
      foreignKey: 'customerOrderId'
    });
  };

  return Item;
};