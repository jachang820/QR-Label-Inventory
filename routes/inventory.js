const express = require('express');
const router = express.Router();

const inventoryGet = require('../controllers/inventoryGet');
//const inventoryViewPost = require('../controllers/inventoryViewPost');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'inventory';
  res.locals.title = 'Inventory';
  return next();
});

router.get('/', inventoryGet);

//router.post('/manual', inventoryViewPost);


module.exports = router;
