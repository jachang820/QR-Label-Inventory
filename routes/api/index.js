const express = require('express');
const router = express.Router();
const factoryOrdersRouter = require('./factory_orders');
const itemsRouter = require('./items');
const usersRouter = require('./users');

router.use('/factory_orders', factoryOrdersRouter);
router.use('/items', itemsRouter);
router.use('/users', usersRouter);

module.exports = router;
