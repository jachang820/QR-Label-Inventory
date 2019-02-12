const express = require('express');
const router = express.Router();

const skusGet = require('../controllers/skusGet');
const skusSizeGet = require('../controllers/skusSizeGet');
const skusPost = require('../controllers/skusPost');
const skusPut = require('../controllers/skusPut');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'skus';
  res.locals.title = 'SKUs';
  res.locals.columns = 7;
  return next();
});

/* Show form for managing SKUs. */
router.get('/', skusGet);

/* Send SKU size information through JSON. */
router.get('/size/:sku', skusSizeGet);

/* Add a new SKU. */
router.post('/', skusPost);

/* Change active status of SKU. If SKU has no items,
   then delete SKU. */
router.put('/', skusPut);

module.exports = router;
