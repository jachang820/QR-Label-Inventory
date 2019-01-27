const express = require('express');
const router = express.Router();
const errorGet = require('../controllers/errorGet');

router.all('*', (req, res, next) => {
  res.locals.css = ['error.css'];
  return next();
});

router.get('/:status', errorGet);

module.exports = router;