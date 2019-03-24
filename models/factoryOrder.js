'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var FactoryOrder = sequelize.define('FactoryOrder', {
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
    notes: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: true
    },
    arrival: {
      type: DataTypes.DATEONLY,
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
    ordered: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'ordered',
    updatedAt: false,
    hooks: {
      afterCreate: formatSerial('F')
    }
  });

  FactoryOrder.associate = models => {
    FactoryOrder.hasMany(models.MasterCarton, {
      foreignKey: 'factoryOrderId'
    });
  }

  return FactoryOrder;
};