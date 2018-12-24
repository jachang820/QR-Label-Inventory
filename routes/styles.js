const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const secured = require('../middleware/secured');
const { create_user_post } = require('../middleware/create_user');
const { Colors, Sizes } = require('../models');

/* GET manage styles page */
router.get('/', secured(), function (req, res, next) {
	axios.defaults.baseURL = process.env.API_PATH;
	
	axios.get('/colors').then((response) => {
		res.render('styles', {
			colors: response.data
		});
	}).catch(next);
});

function create_style(type) {
	axios.defaults.baseURL = process.env.API_PATH;
	upper_type = type.charAt(0).toUpperCase() + type.substring(1);
	router.post('/create', secured(), [
		body('name').trim()
			.isLength({ min: 1 }).withMessage(upper_type.concat(' empty'))
			.custom(value => {
				var get_path = '/' + [type, value].join('/');
				return axios.get(get_path).then(response => {
					if (response.data) {
						return Promise.reject(upper_type.concat(' already in use'));
					}
				});
			}),

		sanitizeBody('name').trim().escape(),

		(req, res, next) => {
			var style = {
				name: req.body.name,
				active: true
			};

			const errors = validationResult(req);
			if (!errors.isEmpty()) {

			} else {
				axios.post('/'.concat(style), {
					name: style.name,
					active: style.active
				}).then((response) => {
		 			// Check for error
		 			if (response.msg) { return next(response); }

		 			res.redirect('/styles');
				}).catch(next);
			}
		}
	]);
}

create_style('color');
create_style('size');

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
