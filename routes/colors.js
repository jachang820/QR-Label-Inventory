const express = require('express');
const router = express.Router();

const stylesGet = require('./controllers/stylesGet');
const stylesPost = require('./controllers/stylesPost');
const stylesPut = require('./controllers/stylesPut');

router.all('*', (req, res, next) => {
	res.locals.css = ['listAll.css'];
	res.locals.modelName = 'colors';
	res.locals.title = 'Colors';
	return next();
});

/* Show form for managing colors. */
router.get('/', stylesGet('color'));

/* Add a new color. */
router.post('/', stylesPost('color'));

/* Change active status of color. If color has no items,
   then delete color. */
router.put('/', stylesPut('color'));

module.exports = router;
