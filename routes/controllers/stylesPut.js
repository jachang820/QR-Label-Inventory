const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const setupAxios = require('../../helpers/setupAxios');
const getModel = require('../../middleware/getModel');

/* Updates style status. */
module.exports = (type) => {

  /* Commonly used string variations. */
  var cap_type = type.charAt(0).toUpperCase() + type.substring(1);
  var types = `${type}s`;

  return [

    /* Get all of the style. */
    getModel(types, 'res', 'name'),

    /* Ensure that styles have been selected. */
    (req, res, next) => {
      return express.Router().use(body('name').trim()
        .isIn(res.locals[`${types}Name`])
        .withMessage(`${cap_type} does not exist.`)
      )(req, res, next);
    },

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody("names").trim().escape(),

    /* Handle errors. */
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }
      return next();
    },

    /* Get matching style from database. */
    (req, res, next) => {
      for (let i = 0; i < res.locals[types].length; i++) {
        if (req.body.name == res.locals[types][i].name) {
          res.locals[type] = res.locals[types][i];
          break;
        }
      }
      return next();
    },

    /* Update new style statuses. If style is active and has no
       corresponding SKUs, it will be deleted. Otherwise, the 
       style is set inactive if it was active, and active if it 
       was inactive. */
    async (req, res, next) => {
      const axios = setupAxios();
      const style = res.locals[type];
      let response;

      /* New, unused style. */
      if (style.active && !style.used) {
        try {
          response = await axios.delete(`/${types}/${style.name}`);
        } catch (err) {
          err.custom = `Unable to delete ${style.name}.`;
          return next(err);
        }

      /* Style is used, so toggle active. */
      } else {
        try {
          response = await axios.put(`/${types}/${style.name}`, {
            active: !style.active
          });
        } catch (err) {
          err.custom = `Unable to change status for ${style.name}.`;
          return next(err);
        }
      }

      return res.json();
    }

  ];

};