const express = require('express');
const router = express.Router();

const eventGet = require('../controllers/eventsGet');

/* Show all events. */
router.get('/', eventGet);

module.exports = router;
