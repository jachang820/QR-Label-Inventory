'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var InnerCarton = sequelize.define('InnerCarton', {
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
      afterCreate: formatSerial('I')
    }
  });

  InnerCarton.associate = models => {
    InnerCarton.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId'
    });
    InnerCarton.hasMany(models.Item, {
      foreignKey: 'innerId'
    });
    InnerCarton.belongsTo(models.Sku, {
      foreignKey: 'sku',
    });
  }

  return InnerCarton;
};