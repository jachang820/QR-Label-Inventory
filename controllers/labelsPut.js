const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Labels = require('../services/label');

/* Updates account status. */
module.exports = [

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody("prefix").trim().stripLow(),
  sanitizeBody("style").trim().escape().stripLow(),

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
      await labels.changeState(
        req.body.prefix,
        req.body.style
      );
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