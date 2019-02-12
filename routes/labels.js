const express = require('express');
const router = express.Router();

const labelsGet = require('../controllers/labelsGet');
const labelsPost = require('../controllers/labelsPost');
const labelsPut = require('../controllers/labelsPut');

router.all('*', (req, res, next) => {
  res.locals.css = ['listView.css'];
  res.locals.modelName = 'labels';
  res.locals.title = 'Labels';
  res.locals.columns = 5;
  return next();
});

/* Show form for managing label URLs. */
router.get('/', labelsGet);

/* Add a new label URL. */
router.post('/', labelsPost);

/* Hide unused label URLs. */
router.put('/', labelsPut);

module.exports = router;
