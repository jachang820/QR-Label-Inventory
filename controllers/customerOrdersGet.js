const Skus = require('../services/sku');

/* Show orders page. */
module.exports = [

  /* Render page. */
  (req, res, next) => {
    return res.render('customer_orders');
  }
];
