const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Labels = require('../services/label');

/* Get the necessary information to populate form. */
module.exports = [

  /* Validate prefix. */
  body('prefix').trim()
    .isLength({ min: 1 }).withMessage("Prefix empty.")
    .isLength({ min: 12 }).withMessage("Prefix too short.")
    .isLength({ max: 42 }).withMessage("Prefix too long.")
    .custom((prefix, { req }) => {
      /* Regex for a url path. */
      const regex = new RegExp([
        /^https?:\/\/([\w-]+\.)+/,
        /((com)|(net)|(org)|(uk)|(cn)|(ca)|(mx)|(info)|(biz)|(name)|(mobi))/, 
        /(\/[\w-.,@$%*+;]+)*\/?$/
      ].map(r => r.source).join(''));

      const match = prefix.match(regex);
      if (!match) {
        throw new Error("Invalid URL.");
      }
      return true;
    }),

  /* Validate style. */
  body('style').trim()
    .isLength({ min: 1 }).withMessage("Style not selected."),

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('prefix').trim().stripLow(),
  sanitizeBody('style').trim().escape().stripLow(),

  /* Handle error. */
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    return next();
  },

  /* Create new label setting in database. */
  async (req, res, next) => {
    const labels = new Labels();
    let label;
    
    try {
      label = await labels.add(
        req.body.prefix,
        req.body.style
      );
      return res.json({ added: label });

    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.json({ errors: err.errors });
      } else {
        return res.json({ errors: 'unknown'});
      }
    }
  }
];