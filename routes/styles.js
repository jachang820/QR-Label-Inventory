const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const secured = require('../middleware/secured');
const { create_color, create_size } = require('../middleware/create_style');
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

router.post('styles/color/add', secured(), create_color);

function create_style(type) {
	axios.defaults.baseURL = process.env.API_PATH;
	upper_type = type.charAt(0).toUpperCase() + type.substring(1);
	type_plural = type.concat('s');
	slash_type = '/'.concat(type);

	router.post(['styles', type, 'add'].join('/'), secured(), [

		(req, res, next) => {
			var style = {
				name: req.body[['new', type].join('_')],
			};

			var action;
			if (req.body[['toggle', type].join('_')]) {
				action = 'toggle';
			}
			if (req.body[['add', type].join('_')]) {
				action = 'add';
			}

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				var params = { errors: errors.array() };

				axios.get(['/', type, 's'].join(''))
					 .then((response) => { 
					 		params[type_plural] = response.data;
					 		params[[fill, type].join('_')] = style.name;
					 		res.render('styles', params);
							return;
						}).catch(next);

			} else { 
				if (action == 'toggle') {


				} else {
					axios.post('/'.concat(style), {
						name: style.name
					}).then((response) => {
			 			// Check for error
			 			if (response.msg) { return next(response); }
						
						res.redirect('/styles');

					}).catch(next);
				}
			}
		}
	]);
}


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
