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
      unique: true,
      allowNull: true,
      validate: {
        notContains: {
          args: ' ',
          msg: "Serial cannot contain whitespace."
        }
      }
    },
    type: {
      type: DataTypes.ENUM,
      values: ['Retail', 'Wholesale'],
      defaultValue: 'Retail',
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Order type must exist."
        },
        isIn: {
          args: [['Retail', 'Wholesale']],
          msg: "Order type is invalid."
        }
      }
    },
    notes: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: true
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "Hidden must be either true or false."
        }
      }
    },
    shipped: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'shipped',
    updatedAt: false,
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