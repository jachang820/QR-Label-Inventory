const setupAxios = require('../../helpers/setupAxios');

/* Show orders page. */
module.exports = (orderType) => {

  return async (req, res, next) => {
    const axios = setupAxios();
    let orders;
    let skus;

    try {
      orders = await axios.get(`/${orderType}_orders`);
      skus = await axios.get('/skus');
    }
    catch (err) {
      return next(err);
    }

    return res.render(`${orderType}_orders`, { 
      orders: orders.data, 
      skus: skus.data 
    });
  };
};