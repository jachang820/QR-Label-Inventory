const express = require('express');
const router = express.Router();
const secured = require('../middleware/secured');
const { User } = require('../models')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET user profile */
router.get('/user', secured(), function (req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;
	res.render('user', {
		userProfile: JSON.stringify(userProfile, null, 2),
		title: 'Profile page'
	});
});

module.exports = router;