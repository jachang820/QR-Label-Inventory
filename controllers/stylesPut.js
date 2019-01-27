const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const express = require('express');
const Colors = require('../services/color');
const Sizes = require('../services/size');

/* Updates style status. */
module.exports = (type) => {

  const styles = (type === 'color') ? new Colors() : new Sizes();

  /* Commonly used string variations. */
  var cap_type = type.charAt(0).toUpperCase() + type.substring(1);

  return [

    /* Trim trailing spaces and remove escape characters to prevent
       SQL injections. */
    sanitizeBody("names").trim().escape().stripLow(),

    /* Handle errors. */
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }
      return next();
    },

    /* Update new style statuses. If style is active and has no
       corresponding SKUs, it will be deleted. Otherwise, the 
       style is set inactive if it was active, and active if it 
       was inactive. */
    async (req, res, next) => {
      try {
        await styles.changeState(req.body.name);
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

};