'use strict';
const formatSerial = require('../helpers/formatSerial');

module.exports = (sequelize, DataTypes) => {
  var Item = sequelize.define('Item', {
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
    status: {
      type: DataTypes.ENUM,
      values: ['ordered', 'in stock', 'shipped', 'cancelled'],
      defaultValue: 'ordered',
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Status must exist."
        },
        isIn: {
          args: [['ordered', 'in stock', 'shipped', 'cancelled']],
          msg: "Status is invalid."
        }
      }
    },
    created: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    hooks: {
      afterCreate: formatSerial('U')
    }
  });

  Item.associate = models => {
    Item.belongsTo(models.Sku, {
      foreignKey: 'sku'
    });
    Item.belongsTo(models.InnerCarton, {
      foreignKey: 'innerId'
    });
    Item.belongsTo(models.MasterCarton, {
      foreignKey: 'masterId'
    });
    Item.belongsTo(models.FactoryOrder, {
      foreignKey: 'factoryOrderId'
    });
    Item.belongsTo(models.CustomerOrder, {
      foreignKey: 'customerOrderId'
    });
  };

  return Item;
};