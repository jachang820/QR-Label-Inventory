/* Get enumerated values of a model table column.
   model: STRING, lower-case, usually plural, name of model.
   field: STRING, name of column */
module.exports = (model, field) => {
  const modelUp = model.charAt(0).toUpperCase() + model.substr(1);
  const Model = require('../models')[modelUp];

  return Model.rawAttributes[field].values;
}