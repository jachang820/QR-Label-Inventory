'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var CustomerOrder = sequelize.define('CustomerOrder', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true
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
    },
    shipped: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'shipped',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: formatSerial('C')
    }
  });

  CustomerOrder.associate = models => {
    CustomerOrder.hasMany(models.Item, {
      foreignKey: 'customerOrderId'
    });
  }

  return CustomerOrder;
};