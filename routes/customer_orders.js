const express = require('express');
const router = express.Router();
const setupAxios = require('../helpers/setupAxios');

const customerOrdersPost = require('./controllers/customerOrdersPost');

router.get('/', async (req, res, next) => {
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
});

router.get('/:id', async (req, res, next) => {
  const axios = setupAxios();

  const orderId = req.params.id;

  let ordersRes;
  let itemsRes;

  try {
    ordersRes = await axios.get(`customer_orders/${orderId}`);
    itemsRes = await axios.get(`/items/customer_order/${orderId}`);
  }
  catch (err) {
    return next(err);
  }

  const order = ordersRes.data;
  const items = itemsRes.data;

  res.render('customer_orders_detail', {
    order,
    items
  });
});

router.post('/', customerOrdersPost);

module.exports = router;
