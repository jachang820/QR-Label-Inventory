'use strict';
module.exports = (sequelize, DataTypes) => {
  var Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: {
          args: [4],
          msg: "ID is invalid. Must be UUID format."
        }
      }
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
      values: ['administrator', 'shipper', 'factory', 'partner'],
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Role must be assigned."
        },
        isIn: {
          args: [['administrator', 'shipper', 'factory', 'partner']],
          msg: "Role is invalid."
        }
      }
    },
    created: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false
  });

  return Profile;
};