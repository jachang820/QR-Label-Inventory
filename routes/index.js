const express = require('express');
const router = express.Router();
const api = require('./api');

router.use('/api', api);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET dashboard. */
router.get('/dashboard', function(req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;

	// email: userProfile.email[0].value
	res.render('dashboard', {
		userProfile: JSON.stringify(userProfile, null, 2)
	})
})

module.exports = router;
