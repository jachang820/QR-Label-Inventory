'use strict';
const serialFormat = require('../helpers/serialFormat');

module.exports = (sequelize, DataTypes) => {
  var InnerCarton = sequelize.define('InnerCarton', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'uniqueInner'
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'uniqueInner'
    }
  }, {
    hooks: {
      afterCreate: (carton, options) => {

        /* Prevent record if alias is same format as serial. */
        if (carton.alias.startsWith('I-') && carton.alias.length === 8) {
          return sequelize.Promise
        }

        /* Update serial based on ID. */
        return carton.update({
          serial: `I-${serialFormat(carton.id)}`
        }, {
          transaction: options.transaction
        });
      }
    }
  });

  InnerCarton.associate = models => {
    InnerCarton.belongsTo(models.MasterCarton);
    InnerCarton.hasMany(models.Item);
  }

  InnerCarton.find = async (where, options = {}) => {



  }



  return InnerCarton;
};