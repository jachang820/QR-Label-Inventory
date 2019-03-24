const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('../controllers/indexGet');

const authRouter = require('./auth');
const eventRouter = require('./events');
const customerRouter = require('./customer_orders');
const inventoryRouter = require('./inventory');
const factoryRouter = require('./factory_orders');
const accountsRouter = require('./accounts');
const colorsRouter = require('./colors');
const sizesRouter = require('./sizes');
const skusRouter = require('./skus');
const labelsRouter = require('./labels');
const manualRouter = require('./manual');
const errorRouter = require('./error');

/* GET home page. */
router.get('/', indexGet);
router.use('/auth', authRouter);

/* Protected pages. */
router.use(secured);
router.use('/events', auth('AS'), eventRouter);
router.use('/inventory', inventoryRouter);
router.use('/factory_orders', auth('ASF'), factoryRouter);
router.use('/accounts', auth('A'), accountsRouter);
router.use('/customer_orders', auth('AS'), customerRouter);
router.use('/colors', auth('A'), colorsRouter);
router.use('/sizes', auth('A'), sizesRouter);
router.use('/skus', auth('A'), skusRouter);
router.use('/labels', auth('A'), labelsRouter);
router.use('/manual', manualRouter);
router.use('/error', errorRouter);

module.exports = router;
