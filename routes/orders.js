const express = require('express');
const router = express.Router();

const ordersGet = require('./controllers/ordersGet');
const ordersIdGet = require('./controllers/ordersIdGet');
const ordersPost = require('./controllers/ordersPost');

router.get('/', ordersGet);

router.get('/:id', ordersIdGet);

router.post('/', ordersPost);

module.exports = router;
