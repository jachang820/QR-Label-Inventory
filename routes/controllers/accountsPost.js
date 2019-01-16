const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const { Users } = require('../../models');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

module.exports = [

  /* Validate first name. */
  body('firstname').trim()
    .isLength({ min: 1 }).withMessage('First name empty.')
    .isLength({ max: 32 }).withMessage('First name too long.')
    .isAlpha().withMessage('First name must be alphabet letters.'),

  /* Validate last name. */
  body('lastname').trim()
    .isLength({ min: 1 }).withMessage('Last name empty.')
    .isLength({ max: 32 }).withMessage('Last name too long.')
    .isAlpha().withMessage('Last name must be alphabet letters.'),

  /* Get all users and list of user emails. */
  getModel('users', 'res', 'email'),

  /* Validate email. */
  (req, res, next) => {
    return express.Router().use(body('email').trim()
      .isLength({ max: 64 }).withMessage('Email too long.')
      .isEmail().withMessage('Must be a valid email.')
      .not().isIn(res.locals.usersEmail).withMessage('Email already in use.')
    )(req, res, next);
  },

  /* Validate role. */
  (req, res, next) => {
    const roles = Users.rawAttributes.role.values;
    return express.Router().use(body('role').trim()
      .isLength({ min: 1 }).withMessage('Role unselected.')
      .isIn(roles).withMessage('Must be a valid role.')
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('firstname').trim().escape(),
  sanitizeBody('lastname').trim().escape(),
  sanitizeBody('email').trim().escape(),
  sanitizeBody('role').escape(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Create new user in database. */
  async (req, res, next) => {
    const axios = setupAxios();

    /* This is the new user. */
    let user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      role: req.body.role
    };

    let response;
    try {
      response = await axios.post('/users', user);
    } catch (err) {
      err.custom = 'Error adding new user to database.';
      return next(err);
    }
    res.locals.users = [response.data];
    return next();
  },

  /* Use roles to derive how status should be handled.
     Administrator accounts should not be deleted, so
     they take on an inactive, unused status that has
     no assigned action. */
  (req, res, next) => {
    let users = res.locals.users;
    for (let i = 0; i < users.length; i++) {
      users[i].active = (users[i].role !== 'Administrator');
      users[i].used = false;
    }
    return next();
  },

  /* Get object necessary for list all. */
  prepareList('users'),

  /* Return JSON. */
  (req, res, next) => {
    return res.json({
      added: res.locals.list[0]
    });
  }

];