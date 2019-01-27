const Skus = require('../services/sku');

/* Get the necessary information to populate form. */
module.exports = async (req, res, next) => {
  const skus = new Skus();
  res.locals.list = await skus.getListView();
  res.locals.types = await skus.getSchema();
  return res.render('listView');
};
