const express = require('express');
const router = express.Router();
const auth = require('../middleware/authorize');

const inventoryGet = require('../controllers/inventoryGet');
const inventoryPut = require('../controllers/inventoryPut');
const inventoryNewItemGet = require('../controllers/inventoryNewItemGet');
const inventoryPost = require('../controllers/inventoryPost');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'inventory';
  res.locals.title = 'Inventory';
  return next();
});

/* Show existing items in inventory. */
router.get('/', inventoryGet);

/* Cancel or reuse an item. */
router.put('/:id', auth('A'), inventoryPut);

/* Show form to add new individual item. */
router.get('/new_item', auth('AS'), inventoryNewItemGet);

/* Submit new item. */
router.post('/', auth('AS'), inventoryPost);

module.exports = router;
