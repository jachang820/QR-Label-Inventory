const setupAxios = require('../../helpers/setupAxios');

/* Get information and items pertaining to one customer order to
   print out customer order details table. */
module.exports = async (req, res, next) => {
  const axios = setupAxios();
  const orderId = req.params.id;

  let ordersRes;
  try {
    ordersRes = await axios.get(`customer_orders/${orderId}`);
  }
  catch (err) {
    return next(err);
  }

  const order = ordersRes.data;
  const items = order.Items;

  for (let i = 0; i < items.length; i++) {
    items[i].num = i + 1;
  }

  res.render('customer_orders_detail', {
    order,
    items
  });
};