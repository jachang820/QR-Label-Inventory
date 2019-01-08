const setupAxios = require('../../helpers/setupAxios');

/* Show factory orders page. */
module.exports = async (req, res, next) => {
  const axios = setupAxios();
  let factoryOrdersRes;
  let colorsRes;
  let sizesRes;

  try {
    factoryOrdersRes = await axios.get('/factory_orders');
    colorsRes = await axios.get('/colors');
    sizesRes = await axios.get('/sizes');
  }
  catch (err) {
    return next(err);
  }

  const factoryOrders = factoryOrdersRes.data;
  const colors = colorsRes.data;
  const sizes = sizesRes.data;

  return res.render('orders', { factoryOrders, colors, sizes });
};