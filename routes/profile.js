const express = require('express');
const router = express.Router();
const axios = require('axios');
const secured = require('../middleware/secured');
const { create_user_post } = require('../middleware/create_user');

const { Users } = require('../models');
const profileGet = require('./controllers/profileGet');

router.all('*', secured());

/* GET user profile */
router.get('/', profileGet); 

/* Validates all inputs and create account. */
router.post('/create', secured(), create_user_post);

/* Deletes a user account given his email. */
router.post('/del/:email', secured(), function (req, res, next) {
	var email = req.params.email;
	axios.defaults.baseURL = process.env.API_PATH;

	axios.delete('/users/'.concat(email)).then((response) => {
		res.redirect('/profile');
	}).catch((err) => {
		console.log('Failed to delete user');
		res.redirect('/profile');
	})
});

router.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}
	res.status(404).render('error404', {
		url: req.baseUrl,
		error: err.stack
	});
})

module.exports = router;
