const express = require('express');
const router = express.Router();
const axios = require('axios');
const secured = require('../middleware/secured');
const { create_user_post } = require('../middleware/create_user');
const { Users } = require('../models');

/* GET user profile */
router.get('/', secured(), function (req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;
	
	axios.get(process.env.API_PATH.concat('users'))
	.then((response) => {
		var i;
		for (i = 0; i < response.data.length; i++) {
			response.data[i].del_path = '/profile/del/'.concat(
				response.data[i].email);
		}
		res.render('profile', {
			roles: Users.rawAttributes.role.values,
			firstname: userProfile.firstname,
			lastname: userProfile.lastname,
			email: userProfile.emails[0].value,
			users: response.data
		});
	}).catch(next);
});

router.post('/create', secured(), create_user_post);

router.post('/del/:email', secured(), function (req, res, next) {
	var del_path = [
		process.env.API_PATH,
		'users/',
		req.params.email
	];

	axios.delete(del_path.join('')).then((response) => {
		res.redirect('/profile');
	}).catch((err) => {
		console.log('Failed to delete user');
		res.redirect('/profile');
	})
});

module.exports = router;
