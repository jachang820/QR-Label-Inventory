const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const Skus = require('../../services/sku');

/* Show orders page. */
module.exports = (orderType) => {

  const skus = new Skus();

  return [

    /* Get all orders. */
    getModel(`${orderType}_orders`, 'res'),

    /* Get all SKUs. */
    async (req, res, next) => {
      res.locals.skus = await skus.getListView();
      return next();
    },

    /* Render page. */
    (req, res, next) => {
      return res.render(`${orderType}_orders`, { 
        orders: res.locals[`${orderType}_orders`], 
        skus: res.locals.skus 
      });
    }
  ];
};