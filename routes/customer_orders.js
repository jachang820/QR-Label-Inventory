const express = require('express');
const router = express.Router();
const auth = require('../middleware/authorize');

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

/* Show form to add new customer orders. */
router.get('/', ordersGet);

/* View existing customer orders. */
router.get('/view', ordersViewGet);

/* Get scanned item details for new order form. */
router.get('/:id', ordersIdGet);

/* Cancel or re-enable orders. */
router.put('/view/:id', auth('A'), ordersViewPut);

/* Submit new customer order. */
router.post('/', ordersPost);

/* Show items shipped out by a particular order. */
router.get('/view/details/:id', ordersDetailsGet);

module.exports = router;
