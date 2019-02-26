'use strict';
module.exports = (sequelize, DataTypes) => {

  const regex = new RegExp([
    /^https?:\/\/([\w-]+\.)+/,
    /((com)|(net)|(org)|(uk)|(cn)|(ca)|(mx)|(info)|(biz)|(name)|(mobi))/, 
    /(\/[\w-.,@$%*+;]+)*\/?$/
  ].map(r => r.source).join(''));

  var Label = sequelize.define('Label', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
      values: ['Querystring', 'Path'],
      allowNull: false,
      unique: 'unique_path',
      validate: {
        isIn: {
          args: [['Querystring', 'Path']],
          msg: "Style is invalid."
        }
      }
    },
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