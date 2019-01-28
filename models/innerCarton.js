'use strict';
const serial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var InnerCarton = sequelize.define('InnerCarton', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      validate: {
        isEmpty: {
          msg: "Cannot enter ID manually."
        }
      }
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
      afterCreate: serial.toBase36('I')
    }
  });

  InnerCarton.associate = models => {
    InnerCarton.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId'
    });
    InnerCarton.hasMany(models.Items, {
      foreignKey: 'itemId'
    });
  }

  return InnerCarton;
};