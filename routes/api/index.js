const express = require('express');
const router = express.Router();
const ordersRouter = require('./orders');
const itemsRouter = require('./items');
const scanRouter = require('./scan');

router.use('/customer_orders', ordersRouter('customer'));
router.use('/factory_orders', ordersRouter('factory'));
router.use('/items', itemsRouter);
router.use('/scan', scanRouter);

module.exports = router;
