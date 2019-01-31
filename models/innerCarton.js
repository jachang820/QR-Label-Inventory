'use strict';
const serial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var InnerCarton = sequelize.define('InnerCarton', {
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
      afterCreate: serial.toBase36('I')
    }
  });

  InnerCarton.associate = models => {
    InnerCarton.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId',
      targetKey: 'serial'
    });
    InnerCarton.hasMany(models.Item, {
      foreignKey: 'innerId',
      targetKey: 'serial'
    });
    InnerCarton.belongsTo(models.Sku, {
      foreignKey: 'sku',
    });
  }

  return InnerCarton;
};