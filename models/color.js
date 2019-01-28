'use strict';
module.exports = (sequelize, DataTypes) => {
  var Color = sequelize.define('Color', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: { 
        isLowercase: {
          msg: "Color name must be in lower case."
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

  Color.associate = models => {
    Color.hasMany(models.Sku, { foreignKey: 'color' });
  };

  return Color;
};