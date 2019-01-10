const express = require('express');
const router = express.Router();
const colorsRouter = require('./colors');
const ordersRouter = require('./orders');
const itemsRouter = require('./items');
const scanRouter = require('./scan');
const sizesRouter = require('./sizes');
const usersRouter = require('./users');
const skusRouter = require('./skus');

router.use('/colors', colorsRouter);
router.use('/customer_orders', ordersRouter('customer'));
router.use('/factory_orders', ordersRouter('factory'));
router.use('/items', itemsRouter);
router.use('/scan', scanRouter);
router.use('/sizes', sizesRouter);
router.use('/users', usersRouter);
router.use('/skus', skusRouter);

module.exports = router;
