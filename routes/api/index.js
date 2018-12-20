const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const itemsRouter = require('./items');
const usersRouter = require('./users');

router.use('/items', itemsRouter);
router.use('/users', usersRouter);
=======

const items = require('./items');
const users = require('./users');

router.use('/items', items);
router.use('/users', users);
>>>>>>> Created items-api

module.exports = router;
