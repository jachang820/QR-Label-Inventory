const express = require('express');
const router = express.Router();
const items = require('./items');
const users = require('./users');

router.use('/items', items);
router.use('/users', users);

module.exports = router;
