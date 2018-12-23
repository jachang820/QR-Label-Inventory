const express = require('express');
const router = express.Router();
const colorsRouter = require('./colors');
const customerOrdersRouter = require('./customer_orders');
const factoryOrdersRouter = require('./factory_orders');
const itemsRouter = require('./items');
const scanRouter = require('./scan');
const sizesRouter = require('./sizes');
const usersRouter = require('./users');

router.use('/colors', colorsRouter);
router.use('/customer_orders', customerOrdersRouter);
router.use('/factory_orders', factoryOrdersRouter);
router.use('/items', itemsRouter);
router.use('/scan', scanRouter);
router.use('/sizes', sizesRouter);
router.use('/users', usersRouter);

module.exports = router;
