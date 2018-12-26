const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const secured = require('../middleware/secured');
const { create_color, create_size } = require('../middleware/create_style');
const { toggle_color, toggle_size } = require('../middleware/toggle_style');
const { Colors, Sizes } = require('../models');
const stylesGet = require('./controllers/stylesGet');

/* Make sure logged in user is a valid user. */
router.all('*', secured());

/* GET manage styles page */
router.get('/', stylesGet);

router.post('/color/add', create_color);
router.post('/color/toggle', toggle_color);

function delete_style(type) {
	var post_path = type.concat('/del/:name');
	axios.defaults.baseURL = process.env.API_PATH;
	router.post(type.concat('/del/:name'), secured(), 
	function (req, res, next) {
		var del_path = [type, 's/', req.params.name].join('');
		axios.delete(del_path).then((response) => {
			res.redirect('/styles');
		}).catch((err) => {
			console.log('Failed to delete '.concat(color));
			res.redirect('/styles');
		})
	});
}

delete_style('color');
delete_style('size');

module.exports = router;
