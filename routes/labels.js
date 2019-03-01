const express = require('express');
const router = express.Router();

const labelsGet = require('../controllers/labelsGet');
const labelsPost = require('../controllers/labelsPost');
const labelsPut = require('../controllers/labelsPut');

/* Show form for managing label URLs. */
router.get('/', labelsGet);

/* Add a new label URL. */
router.post('/', labelsPost);

/* Hide unused label URLs. */
router.put('/:id', labelsPut);

module.exports = router;
