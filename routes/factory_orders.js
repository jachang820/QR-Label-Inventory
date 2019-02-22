const express = require('express');
const router = express.Router();

const ordersGet = require('../controllers/factoryOrdersGet');
const ordersSizeGet = require('../controllers/factoryOrdersSizeGet');
const ordersViewGet = require('../controllers/factoryOrdersViewGet');
const ordersViewPut = require('../controllers/factoryOrdersViewPut');
const ordersDetailsGet = require('../controllers/factoryOrdersViewDetailsGet');
const ordersStockPut = require('../controllers/factoryOrdersViewStockPut');
const ordersPost = require('../controllers/factoryOrdersPost');
const ordersLabelsGet = require('../controllers/factoryOrdersLabelsGet');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'factory_orders';
  res.locals.title = 'Factory Orders';
  return next();
});

router.get('/', ordersGet);

/* Send SKU size information through JSON. */
router.get('/size/:sku', ordersSizeGet);

router.get('/view', ordersViewGet);

router.put('/view/:id', ordersViewPut);

router.put('/view/stock/:id', ordersStockPut);

router.post('/', ordersPost);

router.get('/view/labels/:id', ordersLabelsGet);

router.get('/view/details/:id', ordersDetailsGet);

module.exports = router;
