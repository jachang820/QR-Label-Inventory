const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');

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

router.use('/api', apiRouter);
router.use('/auth', authRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', ordersRouter);
router.use('/profile', profileRouter);
router.use('/qr', qrCodeRouter);
router.use('/scan', scanRouter);
router.use('/styles', stylesRouter);

/* GET home page. */
router.get('/', indexGet);

/* GET dashboard. */
router.get('/dashboard', secured(), dashboardGet);

module.exports = router;
