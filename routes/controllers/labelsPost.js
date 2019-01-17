const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');
const enumAttr = require('../../helpers/enumAttr');
const reconstructUrl = require('../../helpers/reconstructUrl');

/* Generates middleware lists for creating label settings. */
module.exports = [

  /* Get all labels. */
  getModel('labels', 'req'),

  /* Validate prefix. */
  body('prefix').trim()
    .isLength({ min: 1 }).withMessage("Prefix empty.")
    .isLength({ max: 128 }).withMessage("Prefix too long.")
    .custom((prefix, { req }) => {
      const style = req.body.style;
      const labels = req.body.labels;
      for (let i = 0; i < labels.length; i++) {
        if (prefix == labels[i].prefix && style == labels.style) {
          throw new Error("Prefix and style combination already in use.");
        }
      }
      return true;
    })
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
  (req, res, next) => {
    const styles = enumAttr('labels', 'style');
    return express.Router().use(body('style').trim()
      .isIn(styles).withMessage("Invalid style selected.")
    )(req, res, next);
  },

  /* Trim trailing spaces and remove escape characters to prevent
     SQL injections. */
  sanitizeBody('prefix').trim().escape(),
  sanitizeBody('style').trim().escape(),

  /* Reconstruct prefix path. */
  (req, res, next) => {
    req.body.prefix = reconstructUrl(req.body.prefix);
    return next();
  },

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
    const axios = setupAxios();

    /* This is the new setting. */
    let label = {
      prefix: req.body.prefix,
      style: req.body.style  
    };

    let response;
    try {
      response = await axios.post('/labels', label);
    } catch(err) {
      err.custom = 'Error adding new label setting to database.';
      return next(err);
    }
    res.locals.labels = [response.data];
    return next();
  },

  /* Get object necessary for list all. */
  prepareList('labels'),

  /* Return JSON. */
  (req, res, next) => {
    return res.json({
      added: res.locals.list[0]
    });
  }
];