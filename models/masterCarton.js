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
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "Hidden must be either true or false."
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
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