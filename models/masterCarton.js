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
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: serial.toBase36('M')
    },
    tableName: 'MasterCarton'
  });

  MasterCarton.associate = models => {
    MasterCarton.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId',
      targetKey: 'serial'
    });
    MasterCarton.hasMany(models.InnerCarton, {
      foreignKey: 'masterId',
      targetKey: 'serial'
    });
    MasterCarton.belongsTo(models.Sku, {
      foreignKey: 'sku'
    });
  };

  return MasterCarton;
};