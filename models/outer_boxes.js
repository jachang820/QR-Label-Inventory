'use strict';
module.exports = (sequelize, DataTypes) => {
  var OuterBoxes = sequelize.define('OuterBoxes', {
    id: {
      type: DataTypes.UUID,
      defaultvalue: DataTypes.UUIDV4,
      primaryKey: true
    }
  });

  InnerBoxes.associate = models => {
    OuterBoxes.hasMany(models.Items);
  }

  return OuterBoxes;
};