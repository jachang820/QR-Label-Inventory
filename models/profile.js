'use strict';
module.exports = (sequelize, DataTypes) => {
  var Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name must exist."
        },
        len: {
          args: [1, 64],
          msg: "First name too long."
        },
        is: {
          args: /^[A-Za-z\s-'.!]+$/,
          msg: "Invalid characters in first name."
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name must exist."
        },
        len: {
          args: [1, 64],
          msg: "Last name too long."
        },
        is: {
          args: /^[A-Za-z\s-'.!]+$/,
          msg: "Invalid characters in last name."
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Email must exist."
        },
        isEmail: {
          msg: "Email format is invalid."
        }
      }
    },
    role: {
      type: DataTypes.ENUM,
      values: ['Administrator', 'Shipper', 'Factory', 'Partner'],
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Role must be assigned."
        },
        isIn: {
          args: [['Administrator', 'Shipper', 'Factory', 'Partner']],
          msg: "Role is invalid."
        }
      }
    }
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false
  });

  return Profile;
};