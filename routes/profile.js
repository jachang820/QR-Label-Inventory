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

module.exports = router;
