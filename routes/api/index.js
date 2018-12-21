const express = require('express');
const router = express.Router();
const colorsRouter = require('./colors');
const itemsRouter = require('./items');
const sizesRouter = require('./sizes');
const usersRouter = require('./users');

router.use('/colors', colorsRouter);
router.use('/items', itemsRouter);
router.use('/sizes', sizesRouter);
router.use('/users', usersRouter);

module.exports = router;
