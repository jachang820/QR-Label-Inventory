const express = require('express');
const router = express.Router();
const colorsRouter = require('./colors');
const customerOrdersRouter = require('./customer_orders');
const factoryOrdersRouter = require('./factory_orders');
const itemsRouter = require('./items');
const sizesRouter = require('./sizes');

router.use('/colors', colorsRouter);
router.use('/customer_orders', customerOrdersRouter);
router.use('/factory_orders', factoryOrdersRouter);
router.use('/items', itemsRouter);
router.use('/sizes', sizesRouter);

module.exports = router;
