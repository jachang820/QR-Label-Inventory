const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Generates middleware lists for creating colors and sizes. */
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
          style = await styles.add(req.body.name);
        } else {
          style = await styles.add(
            req.body.name,
            req.body.innerSize,
            req.body.masterSize
          );
        }
        
        /* Return JSON with new style. */
        return res.json({ added: style });
      
      } catch (err) {
        if (err.name === 'ValidationError') {
          return res.json({ errors: err.errors });
        } else {
          return res.json({ errors: 'unknown'});
        }
      } 
    }

  ];
};