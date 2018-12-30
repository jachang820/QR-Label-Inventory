const express = require('express');
const router = express.Router();
const axios = require('axios');

const ordersPost = require('./controllers/ordersPost');

router.get('/', async (req, res, next) => {
  axios.defaults.baseURL = process.env.API_PATH;
  let factoryOrdersRes;
  let colorsRes
  let sizesRes;

  try {
    factoryOrdersRes = await axios.get('/factory_orders');
    colorsRes = await axios.get('/colors');
    sizesRes = await axios.get('/sizes')
  }
  catch (err) {
    return next(err);
  }


  const factoryOrders = factoryOrdersRes.data;
  const colors = colorsRes.data;
  const sizes = sizesRes.data;

  return res.render('orders', { factoryOrders, colors, sizes });
});

router.get('/:id', async (req, res, next) => {
  axios.defaults.baseURL = process.env.API_PATH;

  const orderId = req.params.id;
  const itemsRes = await axios.get(`/items/factory_order/${orderId}`);
  const items = itemsRes.data;

  res.render('orders_detail', {
    orderId,
    items
  });
});

router.post('/', ordersPost);

module.exports = router;
