const express = require('express');
const router = express.Router();
const secured = require('../lib/middleware/secured');
const api = require('./api');
const authRouter = require('./auth');
const usersRouter = require('./users');
const qrCodeRouter = require('./qr_code');

router.use('/api', api);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/qr', qrCodeRouter);

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
})

module.exports = router;
