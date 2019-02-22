const express = require('express');
const router = express.Router();

const ordersGet = require('../controllers/customerOrdersGet');
const ordersIdGet = require('../controllers/customerOrdersIdGet');
const ordersViewGet = require('../controllers/customerOrdersViewGet');
const ordersViewPut = require('../controllers/customerOrdersViewPut');
const ordersDetailsGet = require('../controllers/customerOrdersViewDetailsGet');
const ordersPost = require('../controllers/customerOrdersPost');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'customer_orders';
  res.locals.title = 'Customer Orders';
  return next();
});

router.get('/', ordersGet);

router.get('/view', ordersViewGet);

router.get('/:id', ordersIdGet);

router.put('/view/:id', ordersViewPut);

router.post('/', ordersPost);

router.get('/view/details/:id', ordersDetailsGet);

module.exports = router;
