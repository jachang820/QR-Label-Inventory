const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('../controllers/indexGet');

const authRouter = require('./auth');
const customerRouter = require('./customer_orders');
const inventoryRouter = require('./inventory');
const factoryRouter = require('./factory_orders');
const accountsRouter = require('./accounts');
//const scanRouter = require('./scan');
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

/* Protected pages. */
router.use(secured);
router.use('/inventory', inventoryRouter);
router.use('/factory_orders', auth(['AS']), factoryRouter);
router.use('/accounts', auth(['A']), accountsRouter);
//router.use('/scan', scanRouter);
router.use('/customer_orders', auth(['AS']), customerRouter);
router.use('/colors', auth(['A']), colorsRouter);
router.use('/sizes', auth(['A']), sizesRouter);
router.use('/skus', auth(['A']), skusRouter);
router.use('/labels', auth(['A']), labelsRouter);
router.use('/error', errorRouter);

module.exports = router;
