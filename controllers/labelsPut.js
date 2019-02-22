const { param, validationResult } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const express = require('express');
const Labels = require('../services/label');

/* Updates account status. */
module.exports = [

  /* Validate Id. */
  param("id").trim()
    .isInt({ min: 1 }).withMessage("Invalid id."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeParam("id").trim().stripLow(),

  /* Handle errors. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Update new label statuses. Set label to hidden if active,
     and active if hidden. */
  async (req, res, next) => {
    const labels = new Labels();
    try {
      await labels.changeState(req.params.id);
      return res.json();

    } catch (err) {
      return res.json({ errors: err.errors || 'unknown' });
    }
  }

];