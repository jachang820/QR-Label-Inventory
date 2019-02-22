'use strict';

module.exports = (sequelize, DataTypes) => {
  let Sku = sequelize.define('Sku', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        is: {
          args: /^[A-Za-z-]+$/,
          msg: "Only letters and dashes allowed in SKU ID."
        },
        len: {
          args: [4, 32],
          msg: "SKU ID must be between 4-32 characters."
        }
      }
    },
    upc: {
      type: DataTypes.STRING(12),
      allowNull: false,
      validate: {
        len: {
          args: [12, 14],
          msg: "UPC must be between 12-14 digits."
        },
        isNumeric: {
          msg: "UPC must be numeric."
        }
      }
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
    },
    created: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false,
    paranoid: true,
    deletedAt: 'hidden'
  });

  Sku.associate = models => {
    Sku.belongsTo(models.Size, { foreignKey: 'sizeId' });
    Sku.belongsTo(models.Color, { foreignKey: 'colorId' });
  };

  return Sku;
}