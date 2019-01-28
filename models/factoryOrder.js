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
      allowNull: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true
    },
    arrival: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "Used must be either true or false."
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: serial.toBase36('F')
    }
  });

  FactoryOrder.associate = models => {
    FactoryOrder.hasMany(models.Items);
  }

  return FactoryOrder;
};