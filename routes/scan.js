const express = require('express');
const router = express.Router();
const scanGet = require('./controllers/scanGet');
const scanPost = require('./controllers/scanPost');

router.get('/', scanGet);

router.post('/', scanPost);

module.exports = router;
