const express = require('express');
const router = express.Router();

const customerOrdersGet = require('./controllers/customerOrdersGet');
const customerOrdersPost = require('./controllers/customerOrdersPost');
const customerOrdersIdGet = require('./controllers/customerOrdersIdGet');

/* Show customer orders page. */
router.get('/', customerOrdersGet);

/* Get order and items for details page. */
router.get('/:id', customerOrdersIdGet);

/* Add an order. */
router.post('/', customerOrdersPost);

module.exports = router;
