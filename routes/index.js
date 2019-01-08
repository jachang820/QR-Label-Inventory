const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('./controllers/indexGet');
const dashboardGet = require('./controllers/dashboardGet');

const apiRouter = require('./api/index');
const authRouter = require('./auth');
const customerOrdersRouter = require('./customer_orders');
const inventoryRouter = require('./inventory');
const itemRouter = require('./item');
const ordersRouter = require('./orders');
const profileRouter = require('./profile');
const qrCodeRouter = require('./qr_code');
const scanRouter = require('./scan');
const stylesRouter = require('./styles');

/* Public pages. */
router.all('/', (req, res, next) => {
	res.locals.css = ['index.css'];
	return next();
});

/* GET home page. */
router.get('/', indexGet);
router.use('/auth', authRouter);

/* Temporary public pages (for testing purposes). */
router.use('/qr', qrCodeRouter);

/* Protected pages. */
router.use(secured);
router.use('/api', apiRouter);
router.use('/item', itemRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', auth(['A']), ordersRouter);
router.use('/profile', profileRouter);
router.use('/scan', scanRouter);
router.use('/customer_orders', customerOrdersRouter);
router.use('/styles', auth(['A']), stylesRouter);

module.exports = router;
