'use strict';
module.exports = (sequelize, DataTypes) => {

  const regex = new RegExp([
    /^https?:\/\/([\w-]+\.)+/,
    /((com)|(net)|(org)|(uk)|(cn)|(ca)|(mx)|(info)|(biz)|(name)|(mobi))/, 
    /(\/[\w-.,@$%*+;]+)*\/?$/
  ].map(r => r.source).join(''));

  var Label = sequelize.define('Label', {
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
    prefix: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'unique_path',
      validate: {
        is: {
          args: regex,
          msg: "Label URL is invalid."
        },
        len: {
          args: [12,42],
          msg: "Label URL must be between 12-42 characters."
        }
      }
    },
    style: {
      type: DataTypes.ENUM,
      values: ['querystring', 'path'],
      allowNull: false,
      unique: 'unique_path',
      validate: {
        isIn: {
          args: [['querystring', 'path']],
          msg: "Style is invalid."
        }
      }
    },
    created: DataTypes.DATEONLY,
    hidden: DataTypes.DATEONLY
  }, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
    deletedAt: 'hidden'
  });

  return Label;
};