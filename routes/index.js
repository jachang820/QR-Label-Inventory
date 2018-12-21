const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const apiRouter = require('./api');
const authRouter = require('./auth');
const inventoryRouter = require('./inventory');
const qrCodeRouter = require('./qr_code');
const usersRouter = require('./users');

router.use('/api', apiRouter);
router.use('/auth', authRouter);
router.use('/inventory', inventoryRouter);
router.use('/qr', qrCodeRouter);
router.use('/users', usersRouter);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET dashboard. */
router.get('/dashboard', secured(), function(req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;

	res.render('dashboard', {
		displayName: userProfile.displayName,
		email: userProfile.emails[0].value,
		userProfile: JSON.stringify(userProfile, null, 2)
	})
});

module.exports = router;
