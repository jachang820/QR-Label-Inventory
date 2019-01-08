const express = require('express');
const router = express.Router();

const profileGet = require('./controllers/profileGet');
const profilePost = require('./controllers/profilePost');
const profileEmailDelete = require('./controllers/profileEmailDelete');

router.all('*', (req, res, next) => {
	res.locals.css = ['profile.css'];
	return next();
});

/* Get all users and populate user management form. */
router.get('/', profileGet); 

/* Validates all inputs and create account. */
router.post('/', profilePost);

/* Deletes a user account given his email. */
router.post('/del/:email', profileEmailDelete);

module.exports = router;
