'use strict';
module.exports = (sequelize, DataTypes) => {
  var Color = sequelize.define('Color', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    abbrev: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isAlpha: {
          msg: "Abbreviation must be alphabetical."
        },
        len: {
          args: [1, 7],
          msg: "Abbreviation must be between 1-7 characters."
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
    Color.hasMany(models.Sku, { foreignKey: 'colorId' });
  };

  return Color;
};