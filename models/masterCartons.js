'use strict';
module.exports = (sequelize, DataTypes) => {
  var MasterCartons = sequelize.define('MasterCartons', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'uniqueMaster'
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'uniqueMaster'
    }
  }, {
    hooks: {
      afterCreate: (carton, options) => {

        /* Prevent record if alias is same format as serial. */
        if (carton.alias.startsWith('M-') && carton.alias.length === 8) {
          options.transaction = null;
        }

        /* Update serial based on ID. */
        return carton.update({
          serial: `M-${serialFormat(carton.id)}`
        }, {
          transaction: options.transaction
        });
      }
    }
  });

  MasterCartons.associate = models => {
    MasterCartons.belongsTo(models.FactoryOrders);
    MasterCartons.hasMany(models.InnerCartons);
  }

  return MasterCartons;
};