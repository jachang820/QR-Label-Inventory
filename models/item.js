'use strict';
const serial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var Item = sequelize.define('Item', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    alias: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        notSerialFormat: serial.notSerialFormat
      }
    },
    status: {
      type: DataTypes.ENUM,
      values: ['ordered', 'in stock', 'shipped', 'cancelled'],
      defaultValue: 'ordered',
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Status must exist."
        },
        isIn: {
          args: [['ordered', 'in stock', 'shipped', 'cancelled']],
          msg: "Status is invalid."
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    hooks: {
      afterCreate: serial.toBase36('U')
    }
  });

  Item.associate = models => {
    Item.belongsTo(models.Sku, {
      foreignKey: 'sku'
    });
    Item.belongsTo(models.InnerCarton, {
      foreignKey: 'innerId',
      targetKey: 'serial'
    });
    Item.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId',
      targetKey: 'serial'
    });
    Item.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId',
      targetKey: 'serial'
    });
    Item.belongsTo(models.CustomerOrder, {
      foreignKey: 'customerOrderId',
      targetKey: 'serial'
    });
  };

  return Item;
};