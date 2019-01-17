const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');

/* Show orders page. */
module.exports = (orderType) => {

  return [

    /* Get all orders. */
    getModel(`${orderType}_orders`, 'res'),

    /* Get all SKUs. */
    getModel('skus', 'res'),

    /* Render page. */
    (req, res, next) => {
      return res.render(`${orderType}_orders`, { 
        orders: res.locals[`${orderType}_orders`], 
        skus: res.locals.skus 
      });
    }
  ];
};