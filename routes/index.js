const express = require('express');
const router = express.Router();
const api = require('./api');
var authRouter = require('./auth');
var usersRouter = require('./users');
var qrCodeRouter = require('./qr_code');

router.use('/api', api);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/qr', qrCodeRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
