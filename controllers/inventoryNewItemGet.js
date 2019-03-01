const Skus = require('../services/sku');

/* Get information to populate form to add new items individually. */
module.exports = [

  /* Get all SKUs. */
  async (req, res, next) => {
    const skus = new Skus();
    res.locals.skus = await skus.getListView();
    res.locals.skus = res.locals.skus.map(e => e.id);
    return next();
  },

  /* Render page. */
  (req, res, next) => {
    res.locals.css = ['listView.css'];
    res.locals.title = 'Add New Items';
    return res.render('new_item');
  }
];
