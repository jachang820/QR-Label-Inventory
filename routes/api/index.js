const express = require('express');
const router = express.Router();
const itemsRouter = require('./items');
const usersRouter = require('./users');

router.use('/items', itemsRouter);
router.use('/users', usersRouter);

module.exports = router;
