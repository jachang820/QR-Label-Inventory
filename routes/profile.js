const express = require('express');
const router = express.Router();
const axios = require('axios');
const secured = require('../middleware/secured');
const { create_user_post } = require('../middleware/create_user');
const identify_self = require('../helpers/identifySelf');
const { Users } = require('../models');

/* GET user profile */
router.get('/', secured(), function (req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;
	axios.defaults.baseURL = process.env.API_PATH;
	
	/* Get the necessary information to populate form. */
	axios.get('/users').then((response) => {
		var email = userProfile.emails[0].value;

		/* Adds a marker to logged-in user's account to prevent
		   a delete button from appearing next to his account, since
		   an admin shouldn't be able to delete his own account. */
		response.data = identify_self(response.data, email);
		res.render('profile', {
			roles: Users.rawAttributes.role.values,
			firstname: userProfile.firstname,
			lastname: userProfile.lastname,
			email: userProfile.emails[0].value,
			users: response.data
		});
	}).catch(next);
});

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

module.exports = router;
