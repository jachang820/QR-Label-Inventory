'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var MasterCarton = sequelize.define('MasterCarton', {
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
    created: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden',
    hooks: {
      afterCreate: formatSerial('M')
    }
  });

  MasterCarton.associate = models => {
    MasterCarton.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId'
    });
    MasterCarton.hasMany(models.InnerCarton, {
      foreignKey: 'masterId'
    });
    MasterCarton.belongsTo(models.Sku, {
      foreignKey: 'sku'
    });
  };

  return MasterCarton;
};