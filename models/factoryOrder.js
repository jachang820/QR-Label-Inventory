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
      unique: false,
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
    ordered: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'ordered',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
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