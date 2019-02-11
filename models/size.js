'use strict';
module.exports = (sequelize, DataTypes) => {
  var Size = sequelize.define('Size', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: { isLowercase: {
        msg: "Size name must be in lower case."
      }}
    },
    abbrev: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isAlpha: {
          msg: "Abbreviation must be alphabetical."
        },
        isLowercase: {
          msg: "Abbreviation must be in lower case."
        },
        len: {
          args: [1, 2],
          msg: "Abbreviation must be between 1-2 characters."
        }
      }
    },
    innerSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { 
        min: {
          args: [1], 
          msg: "Inner size must be positive." },
        max: {
          args: [1000],
          msg: "Inner size is too large." },
        isInt: {
          msg: "Inner size must be an integer."
        }
      }
    },
    masterSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { 
        min: {
          args: [1], 
          msg: "Master size must be positive." },
        max: {
          args: [1000],
          msg: "Master size is too large." },
        isInt: {
          msg: "Master size must be an integer."
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

  Size.associate = models => {
    Size.hasMany(models.Sku, { foreignKey: 'size' });
  };

  return Size;
};