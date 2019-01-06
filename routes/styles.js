const express = require('express');
const router = express.Router();

const stylesGet = require('./controllers/stylesGet');
const stylesPost = require('./controllers/stylesPost');
const stylesPut = require('./controllers/stylesPut');

router.all('*', (req, res, next) => {
	res.locals.css = ['styles.css'];
	return next();
})

/* Show form for managing styles. */
router.get('/', stylesGet);

/* Add a new style. */
router.post('/color', stylesPost('color'));
router.post('/size', stylesPost('size'));

/* Change active status of style. If style has no items,
   then delete style. */
router.put('/color', stylesPut('color'));
router.put('/size', stylesPut('size'));

module.exports = router;
