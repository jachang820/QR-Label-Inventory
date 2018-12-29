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
const stylesRouter = require('./styles');

router.use('/api', apiRouter);
router.use('/auth', authRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', ordersRouter);
router.use('/profile', profileRouter);
router.use('/qr', qrCodeRouter);
router.use('/profile', profileRouter);
router.use('/scan', scanRouter);
router.use('/styles', stylesRouter);

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.user && req.user.hash && req.user.emails) {
		res.redirect('dashboard');
	} else {
		res.render('index', { title: 'Express' });	
	}
});

/* GET dashboard. */
router.get('/dashboard', secured(), (req, res, next) => {
	const {_raw, _json, ...userProfile } = req.user;

	res.render('dashboard', {
		displayName: userProfile.displayName,
		email: userProfile.emails[0].value,
		userProfile: JSON.stringify(userProfile, null, 2)
	})
});

module.exports = router;
