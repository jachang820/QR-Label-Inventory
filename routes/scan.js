const express = require('express');
const router = express.Router();
const scanGet = require('./controllers/scanGet');
const scanPost = require('./controllers/scanPost');

router.all('*', (req, res, next) => {
	res.locals.css = ['scan.css'];
	return next();
});

router.get('/', scanGet);

router.post('/', scanPost);

module.exports = router;