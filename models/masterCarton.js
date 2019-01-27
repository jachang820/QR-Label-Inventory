'use strict';
const serial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var MasterCarton = sequelize.define('MasterCarton', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notSerialFormat: serial.notSerialFormat
      }
    }
  }, {
    hooks: {
      afterCreate: serial.toBase36('M')
    }
  });

  MasterCarton.associate = models => {
    MasterCarton.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId'
    });
    MasterCarton.hasMany(models.InnerCarton, {
      foreignKey: 'innerId'
    });
  };

  return MasterCarton;
};