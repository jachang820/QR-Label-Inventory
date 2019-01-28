const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Profiles = require('../services/profile');

module.exports = [

  /* Validate first name. */
  body('firstName').trim()
    .isLength({ min: 1 }).withMessage('First name empty.')
    .isLength({ max: 32 }).withMessage('First name too long.')
    .isAlpha().withMessage('First name must be alphabet letters.'),

  /* Validate last name. */
  body('lastName').trim()
    .isLength({ min: 1 }).withMessage('Last name empty.')
    .isLength({ max: 32 }).withMessage('Last name too long.')
    .isAlpha().withMessage('Last name must be alphabet letters.'),

  /* Validate email. */
  body('email').trim()
    .isLength({ max: 64 }).withMessage('Email too long.')
    .isEmail().withMessage('Must be a valid email.'),

  /* Validate role. */
  body('role').trim()
    .isLength({ min: 1 }).withMessage('Role unselected.'),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('firstName').trim().escape().stripLow(),
  sanitizeBody('lastName').trim().escape().stripLow(),
  sanitizeBody('email').trim().escape().stripLow(),
  sanitizeBody('role').trim().escape().stripLow(),

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
    let profiles = new Profiles();
    let profile;
    try {
      profile = await profiles.add(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.role
      );
      return res.json({ added: profile });

    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.json({ errors: err.errors });
      } else {
        return res.json({ errors: 'unknown'});
      }
    }
  }

];