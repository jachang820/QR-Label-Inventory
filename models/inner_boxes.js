'use strict';
module.exports = (sequelize, DataTypes) => {
  var InnerBoxes = sequelize.define('InnerBoxes', {
    id: {
      type: DataTypes.UUID,
      defaultvalue: DataTypes.UUIDV4,
      primaryKey: true
    }
  });

  InnerBoxes.associate = models => {
    InnerBoxes.hasMany(models.Items);
  }

  return InnerBoxes;
};