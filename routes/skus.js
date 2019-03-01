const express = require('express');
const router = express.Router();

const skusGet = require('../controllers/skusGet');
const skusPost = require('../controllers/skusPost');
const skusPut = require('../controllers/skusPut');

/* Show form for managing SKUs. */
router.get('/', skusGet);

/* Add a new SKU. */
router.post('/', skusPost);

/* Change active status of SKU. If SKU has no items,
   then delete SKU. */
router.put('/:id', skusPut);

module.exports = router;
