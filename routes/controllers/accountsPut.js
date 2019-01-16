const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');

/* Updates account status. */
module.exports = [

  /* Get all users. */
  getModel('users', 'res', 'email'),

  /* Ensure that users have been selected. */
  (req, res, next) => {
    return express.Router().use(body('email').trim()
      .isIn(res.locals.usersEmail).withMessage('Email does not exist.')
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody("email").trim().escape(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Get matching email from database. */
  (req, res, next) => {
    for (let i = 0; i < res.locals.users.length; i++) {
      if (req.body.email == res.locals.users[i].email) {
        res.locals.user = res.locals.users[i];
        break;
      }
    }
    return next();
  },

  /* Update new user statuses. If user is not administrator,
     it will be deleted. */
  async (req, res, next) => {
    const axios = setupAxios();
    const user = res.locals.user;
    let response;

    if (user.role !== 'administrator') {
      try {
        response = await axios.delete(`/users/${user.email}`);
      } catch (err) {
        err.custom = `Unable to delete ${user.email}.`;
        return next(err);
      }
    } 

    return res.json();
  }

];