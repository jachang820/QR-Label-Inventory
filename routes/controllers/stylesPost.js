const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');
const prepareList = require('../../middleware/prepareList');

/* Generates middleware lists for creating colors and sizes. */
module.exports = (type) => {
  /* Commonly used string variations. */
  const cap_type = type.charAt(0).toUpperCase() + type.substring(1);
  const types = `${type}s`;

  return [

    /* Validate new style name, ensure that they are not already
       in use. */
    body('name').trim()
      .isLength({ min: 1 }).withMessage(`${cap_type} empty.`)
      .isLength({ max: 32 }).withMessage(`${cap_type} too long.`),

    /* Get all of the style. */
    getModel(types, 'res', 'name'),

    /* Ensure that style is not in use. */
    (req, res, next) => {
      return express.Router().use(body('name').trim()
        .not().isIn(res.locals[`${types}Name`])
        .withMessage(`${cap_type} already in use.`)
      )(req, res, next);
    },

    /* Validate inner carton if size. */
    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(body('innerSize').trim()
          .isLength({ min: 1 }).withMessage('Inner carton size must be positive.')
          .isInt().withMessage('Inner carton size must be an integer.')
        )(req, res, next);
      }
      return next();
    },

    /* Validate master carton if size. */
    (req, res, next) => {
      if (type === 'size') {
        return express.Router().use(body('masterSize').trim()
          .isLength({ min: 1 }).withMessage('Master carton size must be positive.')
          .isInt().withMessage('Master carton size must be an integer.')
        )(req, res, next);
      }
      return next();
    },

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody('name').trim().escape(),

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
      const axios = setupAxios();

      /* This is the new style that was just entered. */
      res.locals[type] = {
        name: req.body.name
      };
      if (type === 'size') {
        res.locals[type].innerSize = req.body.innerSize;
        res.locals[type].outerSize = req.body.masterSize;
      }

      let response;
      try{
        response = await axios.post(`/${types}`, res.locals[type]);
      } catch (err) {
        err.custom = `Error adding ${type} to database.`;
        return next(err);
      }
      res.locals[`${types}`] = [response.data];
      return next();
    },

    /* Get object necessary for list all. */
    prepareList(types),

    /* Return JSON. */
    (req, res, next) => {
      return res.json({
        added: res.locals.list[0]
      });
    }

  ];
};