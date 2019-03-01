const express = require('express');
const router = express.Router();
const auth = require('../middleware/authorize');

const ordersGet = require('../controllers/factoryOrdersGet');
const ordersSizeGet = require('../controllers/factoryOrdersSizeGet');
const ordersViewGet = require('../controllers/factoryOrdersViewGet');
const ordersViewPut = require('../controllers/factoryOrdersViewPut');
const ordersDetailsGet = require('../controllers/factoryOrdersViewDetailsGet');
const ordersStockPut = require('../controllers/factoryOrdersViewStockPut');
const ordersPost = require('../controllers/factoryOrdersPost');
const ordersLabelsGet = require('../controllers/factoryOrdersLabelsGet');

/* Show form to add new factory order. */
router.get('/', auth('AS'), ordersGet);

/* Get SKU size information for new order form. */
router.get('/size/:sku', auth('AS'), ordersSizeGet);

/* Show existing factory orders. */
router.get('/view', ordersViewGet);

/* Cancel factory orders. */
router.put('/view/:id', auth('A'), ordersViewPut);

/* Receive factory order to mark it as In Stock. */
router.put('/view/stock/:id', auth('AS'), ordersStockPut);

/* Submit new factory order. */
router.post('/', auth('AS'), ordersPost);

/* Download QR templates. */
router.get('/view/labels/:id', ordersLabelsGet);

/* Expand to show master cartons created by factory order. */
router.get('/view/details/:id', ordersDetailsGet);

module.exports = router;
