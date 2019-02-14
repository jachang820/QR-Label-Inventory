const Skus = require('../services/sku');

/* Show orders page. */
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
    return res.render('factory_orders', {
      skus: res.locals.skus 
    });
  }
];
