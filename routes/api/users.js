const express = require('express');
const router = express.Router();
const { Users } = require('../../models');

router.route('/')
	.get((req, res, next) => {
		Users.findAll().then((users) => {
			res.json(users);
		}).catch(next);
	});

router.route('/create')
	.post((req, res, next) => {
		const firstname = req.body.firstname;
		const lastname = req.body.lastname;
		const email = req.body.email;
		const role = req.body.role;
		
		Users.create({
			firstname,
			lastname,
			email,
			role
		}).then((user) => {
			res.json(user);
		}).catch(next);
	});

router.route('/:id')
	.get((req, res, next) => {
		Users.findOne({ where: { id }}).then((user) => {
			res.json(user);
		}).catch(next);
	})
	.put((req, res, next) => {
		const firstname = req.body.firstname;
		const lastname = req.body.lastname;
		const email = req.body.email;
		const role = req.body.role;

		Users.findOne({ where: { id }}).then((user) => {
			if (firstname != undefined && firstname.length > 0) {
				user.firstname = firstname;
			}
			if (lastname != undefined && lastname.length > 0) {
				user.lastname = lastname;
			}
			if (email != undefined && email.length > 0) {
				user.email = email;
			}
			if (role != undefined && role.length > 0) {
				user.role = role;
			}
			user.save().then((user) => {
				res.json(user);
			});
		}).catch(next);
	})
	.delete((req, res, next) => {
		Users.destroy({ where: { id }}).then((count) => {
			res.json(count);
		}).catch(next);
	});

function oneField(fieldname) {
	router.route('/:id/'.concat(fieldname))
		.get((req, res, next) => {
			Users.findOne({ where: { id }, attributes: [fieldname] })
				.then((user) => {
					res.json(user);
			}).catch(next);
		})
		.put((req, res, next) => {
			const field = req.body[fieldname];
			Users.findOne({ where: { id }, attributes: [fieldname] })
				.then((user) => {
					if (field != undefined && field.length > 0) {
						user[fieldname] = field;
					}
					user.save().then((user) => {
						res.json(user);
					});
				}).catch(next);
		});
}

oneField('firstname');
oneField('lastname');
oneField('email');
oneField('role');

module.exports = router;