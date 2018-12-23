const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const apiRouter = require('./api/index');
const authRouter = require('./auth');
const inventoryRouter = require('./inventory');
const ordersRouter = require('./orders');
const profileRouter = require('./profile');
const qrCodeRouter = require('./qr_code');
const scanRouter = require('./scan');
const usersRouter = require('./users');

router.use('/accounts', accountsRouter);
router.use('/api', apiRouter);
router.use('/auth', authRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', ordersRouter);
router.use('/profile', profileRouter);
router.use('/qr', qrCodeRouter);
<<<<<<< HEAD
router.use('/profile', profileRouter);
=======
router.use('/scan', scanRouter);
router.use('/users', usersRouter);
>>>>>>> master

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
