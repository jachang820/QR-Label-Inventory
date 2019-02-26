const express = require('express');
const router = express.Router();

const manualGet = require('../controllers/manualGet');

router.all('*', (req, res, next) => {
  res.locals.title = 'Manual';
  return next();
});

/* Show instruction manual. */
router.get('/', manualGet);

module.exports = router;
