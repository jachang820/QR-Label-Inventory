const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('../controllers/indexGet');

const apiRouter = require('./api/index');
const authRouter = require('./auth');
const customerOrdersRouter = require('./customer_orders');
const inventoryRouter = require('./inventory');
const itemRouter = require('./item');
const ordersRouter = require('./factory_orders');
const accountsRouter = require('./accounts');
const qrCodeRouter = require('./qr_code');
const scanRouter = require('./scan');
const colorsRouter = require('./colors');
const sizesRouter = require('./sizes');
const skusRouter = require('./skus');
const labelsRouter = require('./labels');
const errorRouter = require('./error');

/* Public pages. */
router.all(/^(\/auth)|(\/$)/, (req, res, next) => {
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
router.use('/factory_orders', auth(['a']), ordersRouter);
router.use('/accounts', auth(['a']), accountsRouter);
router.use('/scan', scanRouter);
router.use('/customer_orders', customerOrdersRouter);
router.use('/colors', auth(['a']), colorsRouter);
router.use('/sizes', auth(['a']), sizesRouter);
router.use('/skus', auth(['a']), skusRouter);
router.use('/labels', auth(['a']), labelsRouter);
router.use('/error', errorRouter);

module.exports = router;
