const express = require('express');
const router = express.Router();
const { Users } = require('../../models');

router.route('/')
  /* GET all users */
  .get((req, res, next) => {
    Users.findAll().then((users) => {
      return res.json(users);
    }).catch(err => next(err));
  })
  /* POST new user account. */
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
      return res.json(user);
    }).catch(err => next(err));
  });

router.route('/:email')
  .get((req, res, next) => {
    const params = req.params.email;
    Users.findOne({ where: { 'email': params }}).then((user) => {
      return res.json(user);
    }).catch(err => next(err));
  })
  .put((req, res, next) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const role = req.body.role;
    const params = req.params.email;

    Users.findOne({ where: { 'email': params }}).then((user) => {
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
        return res.json(user);
      });
    }).catch(err => next(err));
  })
  .delete((req, res, next) => {
    const params = req.params.email;
    Users.destroy({ where: { 'email': params }}).then((count) => {
      return res.json(count);
    }).catch(err => next(err));
  });

module.exports = router;