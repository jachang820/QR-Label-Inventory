const express = require('express');
const router = express.Router();
const customerOrdersRouter = require('./customer_orders');
const itemsRouter = require('./items');
const usersRouter = require('./users');

router.use('/customer_orders', customerOrdersRouter);
router.use('/items', itemsRouter);
router.use('/users', usersRouter);

module.exports = router;
