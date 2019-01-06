const setupAxios = require('../../helpers/setupAxios');

/* Retrieve order info and items for details page. */
module.exports = async (req, res, next) => {
  const axios = setupAxios();
  const orderId = req.params.id;
  let ordersRes;
  try {
    ordersRes = await axios.get(`/factory_orders/${orderId}`);
  } catch (err) {
    return next(err);
  }

  let order = ordersRes.data;
  let items = order.Items;

  for (let i = 0; i < items.length; i++) {
    items[i].num = i + 1;
  }

  res.render('orders_detail', { order, items });
};