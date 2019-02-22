const express = require('express');
const router = express.Router();

const inventoryGet = require('../controllers/inventoryGet');
const inventoryNewItemGet = require('../controllers/inventoryNewItemGet');
const inventoryPost = require('../controllers/inventoryPost');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'inventory';
  res.locals.title = 'Inventory';
  return next();
});

router.get('/', inventoryGet);

router.get('/new_item', inventoryNewItemGet);

router.post('/', inventoryPost);


module.exports = router;
