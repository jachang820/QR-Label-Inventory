'use strict';
const serial = require('../helpers/formatSerial');

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
    alias: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        notSerialFormat: serial.notSerialFormat
      }
    },
    arrival: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'ordered',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: serial.toBase36('F')
    }
  });

  FactoryOrder.associate = models => {
    FactoryOrder.hasMany(models.MasterCarton, {
      foreignKey: 'factoryOrderId',
      targetKey: 'serial'
    });
  }

  return FactoryOrder;
};