'use strict';
const serial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var CustomerOrder = sequelize.define('CustomerOrder', {
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
      allowNull: false,
      validate: {
        notSerialFormat: serial.notSerialFormat
      }
    },
    type: {
      type: DataTypes.ENUM,
      values: ['retail', 'wholesale'],
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Order type must exist."
        },
        isIn: {
          args: [['retail', 'wholesale']],
          msg: "Order type is invalid."
        }
      }
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'shipped',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: serial.toBase36('C')
    }
  });

  CustomerOrder.associate = models => {
    CustomerOrder.hasMany(models.Item, {
      foreignKey: 'customerOrderId',
      targetKey: 'serial'
    });
  }

  return CustomerOrder;
};