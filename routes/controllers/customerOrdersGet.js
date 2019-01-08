const setupAxios = require('../../helpers/setupAxios');

/* Show customer orders page. */
module.exports = async (req, res, next) => {
  const axios = setupAxios();
  let customerOrdersRes;
  let colorsRes;
  let sizesRes;

  try {
    customerOrdersRes = await axios.get('/customer_orders');
    colorsRes = await axios.get('/colors');
    sizesRes = await axios.get('/sizes')
  }
  catch (err) {
    return next(err);
  }

  const customerOrders = customerOrdersRes.data;
  const colors = colorsRes.data;
  const sizes = sizesRes.data;

  return res.render('customer_orders', { customerOrders, colors, sizes });
};