const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('./controllers/indexGet');

const apiRouter = require('./api/index');
const authRouter = require('./auth');
const customerOrdersRouter = require('./customer_orders');
const inventoryRouter = require('./inventory');
const itemRouter = require('./item');
const ordersRouter = require('./orders');
const accountsRouter = require('./accounts');
const qrCodeRouter = require('./qr_code');
const scanRouter = require('./scan');
const colorsRouter = require('./colors');
const sizesRouter = require('./sizes');
const skusRouter = require('./skus');

/* Public pages. */
router.all('/', (req, res, next) => {
	res.locals.css = ['index.css'];
	return next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
	res.locals.css = ['index.css'];
	return next();
})
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
router.use('/accounts', auth(['A']), accountsRouter);
router.use('/scan', scanRouter);
router.use('/customer_orders', customerOrdersRouter);
router.use('/colors', auth(['A']), colorsRouter);
router.use('/sizes', auth(['A']), sizesRouter);
router.use('/skus', auth(['A']), skusRouter);

module.exports = router;
