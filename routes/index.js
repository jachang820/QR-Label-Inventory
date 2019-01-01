const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const auth = require('../middleware/authorize');

const indexGet = require('./controllers/indexGet');
const dashboardGet = require('./controllers/dashboardGet');

const indexGet = require('./controllers/indexGet');
const dashboardGet = require('./controllers/dashboardGet');

const apiRouter = require('./api/index');
const authRouter = require('./auth');
const inventoryRouter = require('./inventory');
const ordersRouter = require('./orders');
const profileRouter = require('./profile');
const qrCodeRouter = require('./qr_code');
const scanRouter = require('./scan');
const stylesRouter = require('./styles');

/* Public pages. */

/* GET home page. */
router.get('/', indexGet);
router.use('/auth', authRouter);

/* Temporary public pages (for testing purposes). */
router.use('/qr', qrCodeRouter);
router.use('/scan', scanRouter);

/* Protected pages. */
router.use(secured);
router.use('/api', apiRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', auth(['A']), ordersRouter);
router.use('/profile', profileRouter);
router.use('/styles', auth(['A']), stylesRouter);

/* GET dashboard. */
router.get('/dashboard', dashboardGet);

module.exports = router;
