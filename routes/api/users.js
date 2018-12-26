const express = require('express');
const router = express.Router();
const { Users } = require('../../models');

router.route('/')
  /* GET all users */
  .get((req, res, next) => {
    Users.findAll().then((users) => {
      res.json(users);
    }).catch(next);
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
      res.json(user);
    }).catch(next);
  });

router.route('/:email')
  .get((req, res, next) => {
    const params = req.params.email;
    Users.findOne({ where: { 'email': params }}).then((user) => {
      res.json(user);
    }).catch(next);
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
        res.json(user);
      });
    }).catch(next);
  })
  .delete((req, res, next) => {
    const params = req.params.email;
    Users.destroy({ where: { 'email': params }}).then((count) => {
      res.json(count);
    }).catch(next);
  });

module.exports = router;