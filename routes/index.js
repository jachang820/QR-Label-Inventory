const express = require('express');
const router = express.Router();
const api = require('./api');
const inventory = require('./inventory');

router.use('/api', api);
router.use('/inventory', inventory);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET dashboard. */
router.get('/dashboard', function(req, res, next) {
	const {_raw, _json, ...userProfile } = req.user;

	// email: userProfile.emails[0].value
	res.render('dashboard', {
		displayName: userProfile.displayName,
		email: userProfile.emails[0].value,
		userProfile: JSON.stringify(userProfile, null, 2)
	})
})

module.exports = router;
