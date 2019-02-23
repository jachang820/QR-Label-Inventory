const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const express = require('express');
const Profiles = require('../services/profile');

/* Updates account status. */
module.exports = [

  /* Validate id. */
    param("id").trim()
      .isInt({ min: 1 }).withMessage("Invalid id."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeParam("id").trim().escape().stripLow(),

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
    try {
      await profiles.changeState(req.params.id);
      return res.json();

    } catch (err) {
      console.log(err);
      return res.json({ errors: err.errors || 'unknown' });
    }
  }

];