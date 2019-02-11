const express = require('express');
const router = express.Router();

//const ordersGet = require('./controllers/ordersGet');
const customerOrdersPost = require('./controllers/customerOrdersPost');
const ordersIdGet = require('./controllers/ordersIdGet');

/* Show customer orders page. */
//router.get('/', ordersGet('customer'));

/* Get order and items for details page. */
router.get('/:id', ordersIdGet('customer'));

/* Add an order. */
router.post('/', customerOrdersPost);

module.exports = router;
