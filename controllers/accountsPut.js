const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Profiles = require('../services/profile');

/* Updates account status. */
module.exports = [

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody("email").trim().escape().stripLow(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Update new user statuses. If user is not administrator,
     it will be deleted. */
  async (req, res, next) => {
    const profiles = new Profiles();
    let profile;
    try {
      profile = await profiles.changeState(req.body.email);
      return res.json();

    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.json({ errors: err.errors });
      } else {
        return res.json({ errors: 'unknown'});
      }
    }
  }

];