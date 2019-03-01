const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Create new color or size. */
module.exports = (type) => {

  const styles = (type === 'color') ? new Colors() : new Sizes();

  /* Commonly used string variations. */
  const cap_type = type.charAt(0).toUpperCase() + type.substring(1);

  return [

    /* Validate new style name, ensure that they are not already
       in use. */
    body('name').trim()
      .isLength({ min: 1 }).withMessage(`${cap_type} empty.`)
      .isLength({ max: 32 }).withMessage(`${cap_type} too long.`),

    /* Validate abbreviation. */
    (req, res, next) => {
      if (type === 'color' &&
          req.body.name.length <= 7 &&
          !req.body.abbrev) {

        req.body.abbrev = req.body.name;
      }
      const max = (type === 'size') ? 2 : 7;
      return express.Router().use(body('abbrev').trim()
        .isAlpha().withMessage('Abbreviation must be alphabetical.')
        .isLength({ min: 1 }).withMessage('Abbreviation too short.')
        .isLength({ max: max }).withMessage('Abbreviation too long.')
      )(req, res, next);
    },

    /* Validate inner carton if size. */
    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(body('innerSize').trim()
          .isInt({ min: 1, max: 1000 })
          .withMessage('Inner carton size must be positive integer.')
        )(req, res, next);
      }
      return next();
    },

    /* Validate master carton if size. */
    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(body('masterSize').trim()
          .isInt({ min: 1, max: 1000 })
          .withMessage('Master carton size must be positive integer.')
        )(req, res, next);
      }
      return next();
    },

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody('name').trim().escape().stripLow(),
    sanitizeBody('abbrev').trim().escape().stripLow(),

    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(
          sanitizeBody('innerSize').trim().escape()
        )(req, res, next);
      }
      return next();
    },

    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(
          sanitizeBody('masterSize').trim().escape()
        )(req, res, next);
      }
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

    /* Create new style in database. */
    async (req, res, next) => {
      let style;
      try {
        if (type === 'color') {
          style = await styles.add(
            req.body.name,
            req.body.abbrev
          );
        } else {
          style = await styles.add(
            req.body.name,
            req.body.abbrev,
            req.body.innerSize,
            req.body.masterSize
          );
        }
        
        /* Return JSON with new style. */
        return res.json({ added: style });
      
      } catch (err) {
        return res.json({ errors: err.errors || 'unknown' });
      } 
    }

  ];
};